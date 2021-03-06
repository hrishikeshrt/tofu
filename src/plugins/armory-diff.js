define([
    'utils/gui',
    'utils/koc_utils',
    'handlebars-loader!templates/armory-diff.html'
], function(GUI, Koc, ArmoryDiffTemplate) {

    var db = Koc.db;

    return {
        name: "Armory Diff",
        description: "See your stats changes since the last visit to armory",

        defaultEnabled: true,

        enabledPages: ['armory'],

        run: function() {
            this.armoryDiff()
        },

        armoryDiff: function () {
            var obj = {
                sa : db.get('sa'),
                da : db.get('da'),
                spy : db.get('spy'),
                sentry : db.get('sentry')
            };

            function helper(stat) {
                var o = {};
                var diff = obj[stat] - User[stat];
                o[stat] = diff;
                o[stat + 'Percentage'] = (100 * diff / User[stat]).toFixed(2);
                return o;
            }

            var statsDiffObj = _.extend.apply(null, _.map(['sa', 'da', 'spy', 'sentry'], helper));
            var html =  ArmoryDiffTemplate(statsDiffObj);
            $("#military_effectiveness").after(html);
        },
    }
});
