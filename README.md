Boundary Ping Check Plugin
--------------------------

Pings a set of hosts and reports on the response time. The plugin allows multiple hosts to be ping'd and each of those hosts to set their own Poll interval. See video [walkthrough](https://help.boundary.com/hc/articles/201383932).
Note: Currently does not support SmartOS.

### Prerequisites

|     OS    | Linux | Windows | SmartOS | OS X |
|:----------|:-----:|:-------:|:-------:|:----:|
| Supported |   v   |    v    |    -    |  v   |


|  Runtime | node.js | Python | Java |
|:---------|:-------:|:------:|:----:|
| Required |    +    |        |      |

- [How to install node.js?](https://help.boundary.com/hc/articles/202360701)

### Plugin Setup
None

#### Plugin Configuration Fields

|Field Name     |Description                                                                       |
|:--------------|:---------------------------------------------------------------------------------|
|Source         |The source to display in the legend for the host. Ex. google                      |
|Host           |The Hostname or IP Address to ping.  For example, www.google.com or 173.194.33.112|
|Poll Time (sec)|The Poll Interval to send a ping to the host in seconds. Ex. 5                    |

### Metrics Collected

|Metric Name       |Description                            |
|:-----------------|:--------------------------------------|
|Ping Response Time|The response time from the ping command|
