define([
    'utils/gui',
    'utils/koc_utils'
], function(GUI, Koc) {

    var db = Koc.db;
    return {
        name: "Inventory Logger",
        description: "Track changes to weapons over time",

        defaultEnabled: true,

        enabledPages: ['armory'],

        run: function() {
          this.updateWeaponsTracker();
          this.sabLogs_init();
        },
      
        updateWeaponsTracker: function() {
          var currentWeapons = db.getObject('weapons', {});
          var previousWeapons = db.getObject('previousWeapons', {});
          var time_difference = Date.now() - db.getTime('armoryWeaponsLastUpdate');
          var allKeys = _.union(_.keys(currentWeapons), _.keys(previousWeapons));
          var differences = _.reduce(allKeys, function(memo, weapon) {
              var oldCount = previousWeapons[weapon] && previousWeapons[weapon].quantity || 0;
              var newCount = currentWeapons[weapon] && currentWeapons[weapon].quantity || 0;
              if (oldCount != newCount)
                  memo.push({
                      weapon: weapon,
                      delta: newCount - oldCount,
                      time: Date.now(),
                      interval: time_difference});
              return memo;
          }, []);
          
          var changeLog = db.getObject('weaponsTrackerChangelog', []);
          db.putObject('weaponsTrackerChangelog', differences.concat(changeLog));
          
          db.putTime('armoryWeaponsLastUpdate', Date.now());
          db.putObject('previousWeapons', currentWeapons);
        },

        sabLogs_init: function () {
            var $weaponsTable = $('<table id="_lux_sabbed" class="table_lines" width="100%" cellspacing="0" cellpadding="6" border="0"><tbody><tr><th colspan=9>Weapon Tracker Log </th></tr><tr><td colspan=2 style="border-bottom:none"><div id="lux_sablogs_2"></div></td></tr></tbody></table>');
            $("#military_effectiveness").before($weaponsTable);
            this.$table = $weaponsTable;
            this.sabLogs_display();
        },

        sabLogs_display: function () {
            var changeLog = db.getObject('weaponsTrackerChangelog', []);

            var $tbody = this.$table.find('tbody');
            for (i = 0; i < 5 && i < changeLog.length; i++) {
                var line = changeLog[i];
 
                var when = Koc.timeElapsed(line.time);
                var interval = Koc.timeConfidenceFormatter(line.interval);
                $tbody.append("<tr><td>" + line.weapon + "</td><td>" + line.delta + "</td><td align=right>" + when + "</td><td>"+interval+"</td></tr>");
            }
            $tbody.append("<tr><td>(<a id='viewSablog'>View All</a>)</td><td></td><td></td><td>(<a id='clearSablog'>Clear</a>)</td></tr>");
            var self = this;
            $("#clearSablog").click(function () {
                self.sabLogs_clear();
            });
            $("#viewSablog").click(function () {
                self.sabLogs_viewAll();
            });
        },

        sabLogs_clear: function () {
            db.put("lux_lostWeapons", '');
            $("#lux_sablogs_2>table>tbody>tr>td").parent().remove();
        },

        sabLogs_viewAll: function () {
            $("#lux_sablogs_2").css("overflow-y", "scroll");
            $("#lux_sablogs_2").css("height", "180px");
            var losses = db.get('lux_lostWeapons', '').split(';');
            $("#lux_sablogs_2>table>tbody>tr>td").parent().remove();

            var i;
            for (i = 0; i < losses.length; i++) {
                if (losses[i]) {
                    var cols = losses[i].split(':');
                    $("#lux_sablogs_2>table>tbody").append("<tr><td>" + cols[0] + " " + cols[1] + "s</td><td align=right>" + Koc.timeElapsed(cols[2]) + "</td></tr>");
                }
            }
            $(this.$table).append("<tr><td>(<a id='viewSablogLess'>View Less</a>)</td><td>(<a id='clearSablog'>Clear</a>)</td></tr>");
            var self = this;
            $("#clearSablog").click(function () {
                self.sabLogs_clear();
            });
            $("#viewSablogLess").click(function () {
                self.sabLogs_display();
            });
        }
    }
});
