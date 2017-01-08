
frappe.pages['rn-team-tool'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Team Tool',
		single_column: true
	});

	frappe.team_tool_page = page;
	
	page.add_field(
		{
			fieldtype: "Link",
			fieldname: "service_type",
			options: "Item",
			label: __("Service Type"),
			reqd: 1,
			input_css: {"z-index": 1},
			change: function(event) {
				build_route(wrapper);
			},
		}
	);
	page.fields_dict["service_type"].get_query = function() {
		return {
			"filters": {
				"item_group": "Services"
			}
		}
	}
	page.add_field(
		{
			fieldtype: "Select",
			fieldname: "day_of_week",
			options: "Sunday\nMonday\nTuesday\nWednesday\nThursday\nFriday\nSaturday",
			default: "Monday",
			label: __("Day of Week"),
			reqd: 1,
			input_css: {"z-index": 1},
			change: function(event) {
				build_route(wrapper);
			},
		}
	)

	//Set default route
	if (frappe.get_route().length == 1) {
		frappe.set_route("rn-team-tool", page.fields_dict["day_of_week"].get_value());
	}
}

frappe.pages['rn-team-tool'].on_page_show = function(wrapper) {
	//render_weekly_calendar(wrapper);
	var route = frappe.get_route();

	var day_of_week = route[1];
	var service_type = route[2];

	render_allocations(wrapper, service_type, day_of_week);
}

// frappe.pages['rn-team-tool'].refresh = function(wrapper) {
// 	var content = frappe.team_tool_page.wrapper.find(".page-content");

// 	cb = frappe.team_tool_page.wrapper.find("input[type='checkbox']");

// 	if (cb) {
// 		console.log("checkboxes", cb);
// 	}
// }

function build_route(wrapper) { //, show_daily="daily") {
	var service_type = wrapper.page.fields_dict['service_type'].$input.val();
	var day_of_week = wrapper.page.fields_dict['day_of_week'].$input.val();

	var initial_route = frappe.get_route();

	frappe.set_route("rn-team-tool", day_of_week, service_type);

	if (frappe.get_route() == initial_route) {
		frappe.set_route(frappe.get_route());
	};
}

function render_allocations(wrapper, service_type, day_of_week) {
	frappe.call({
		method: "refreshednow_erpnext.api.get_team_tool_data",
		args: {
			service_type: service_type,
			day_of_week: day_of_week
		},
		freeze: true,
		freeze_message: __("Retrieving..."),
		callback: function(r) {
			var content = frappe.team_tool_page.wrapper.find(".page-content");
			frappe.team_tool_page.wrapper.find(".team-allocation").remove();

			console.log("allocations", r.message.data.allocations);

			content.append(frappe.render_template("team_allocation_view", r.message));
		}
	});
}

// function checkboxes_rendered() {
// 	var cb = frappe.team_tool_page.wrapper.find("input[type='checkbox']");
// 	if (cb) {
// 		console.log("checkboxes", cb);
// 	}
// }

function checkbox_clicked(cb) {
	frappe.call({
		method: "refreshednow_erpnext.api.update_team_allocation",
		args: {
			"employee": $(cb).attr("data-employee"),
			"team": $(cb).attr("data-team"),
			"day_of_week": $(cb).attr("data-dow"), //frappe.team_tool_page.fields_dict["day_of_week"],
		},
		callback: function(r) {

		}
	});
}