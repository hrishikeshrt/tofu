define({
	description : "Show projected gold beneath current gold",
	
	defaultEnabled : true,
	
	run : function() {
		var offset = 11; // Seconds after minute until turn arrives.
		
		function nextMinute($obj, income, accumulator) {
			$obj.text("Projection: "+ addCommas(User.gold.int() + income*accumulator));
			
			setTimeout(function() {
				nextMinute($obj, income, accumulator+1);
			}, 60*1000); // Update again in exactly 1 minute
		}
		
		// Add the display to the DOM
		$("tr:contains('Last Attacked:'):last").parent().find("tr:eq(0)")
				.after("<tr><td colspan=2 style='color: BLUE; font-size: 6pt;text-align:center' id='gold_projection'></td></tr>");

		var date = new Date();
		var currentSeconds = date.getSeconds();
		var secsTillTurn =( (60 + offset) - currentSeconds) % 60;
		setTimeout(
			function() {
				nextMinute( $("#gold_projection"), User.income.int(), 1);
			}
			, secsTillTurn*1000
		);
	}
});