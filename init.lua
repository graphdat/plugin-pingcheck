local framework = require('framework')
local CommandOutputDataSource = framework.CommandOutputDataSource
local PollerCollection = framework.PollerCollection
local DataSourcePoller = framework.DataSourcePoller
local Plugin = framework.Plugin
local os = require('os')
local table = require('table')
local string = require('string')

local isEmpty = framework.string.isEmpty
local clone = framework.table.clone

local params = framework.params 

local commands = {
  linux = { path = '/bin/ping', args = {'-n', '-w 2', '-c 1'} },
  win32 = { path = 'C:/windows/system32/ping.exe', args = {'-n', '1', '-w', '3000'} },
  darwin = { path = '/sbin/ping', args = {'-n', '-t 2', '-c 1'} }
}

local ping_command = commands[string.lower(os.type())] 
if ping_command == nil then
  print("_bevent:"..(Plugin.name or params.name)..":"..(Plugin.version or params.version)..":Your platform is not supported.  We currently support Linux, Windows and OSX|t:error|tags:lua,plugin"..(Plugin.tags and framework.string.concat(Plugin.tags, ',') or params.tags))
  process:exit(-1)
end

local function createPollers (params, cmd) 
  local pollers = PollerCollection:new() 
  for _, item in ipairs(params.items) do
    
    cmd = clone(cmd)
    table.insert(cmd.args, item.host)
    cmd.info = item.source

    local data_source = CommandOutputDataSource:new(cmd)
    local poll_interval = tonumber(item.pollInterval or params.pollInterval) * 1000
    local poller = DataSourcePoller:new(poll_interval, data_source)
    pollers:add(poller)
  end

  return pollers
end

local function parseOutput(context, output) 
  
  assert(output ~= nil, 'parseOutput expect some data')

  if isEmpty(output) then
    context:emit('error', 'Unable to obtain any output.')
    return
  end

  if (string.find(output, "unknown host") or string.find(output, "could not find host.")) then
    context:emit('error', 'The host ' .. context.args[#context.args] .. ' was not found.')
    return
  end

  local index
  local prevIndex = 0
  while true do
    index = string.find(output, '\n', prevIndex+1) 
    if not index then break end

    local line = string.sub(output, prevIndex, index-1)
    local _, _, time  = string.find(line, "time=([0-9]*%.?[0-9]+)")
    if time then 
      return tonumber(time)
    end
    prevIndex = index
  end

  return -1
end

local pollers = createPollers(params, ping_command)
local plugin = Plugin:new(params, pollers)

function plugin:onParseValues(data) 
  local result = {}

  local value = parseOutput(self, data['output'])
  result['PING_RESPONSETIME'] = { value = value, source = data['info'] }
  return result
end

plugin:run()
