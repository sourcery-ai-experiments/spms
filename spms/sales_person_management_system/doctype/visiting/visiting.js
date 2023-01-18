// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

/* A query that will filter the doctor name based on the territory. */
frappe.ui.form.on('Visiting', {
	setup: function (frm) {
		frm.set_query("doctor_name", function () {
			return {
				filters: [
					["Doctor", "territory", "in", frm.doc.territory]
				]
			};
		});
	}
});


/* A query that will filter the doctor name based on the territory. */
frappe.ui.form.on('Visiting', {
	setup: function (frm) {
		frm.set_query("reference", function () {
			return {
				filters: [
					["Customer", "territory", "in", frm.doc.territory]
				]
			};
		});
	}
});

// Get Location From The User
frappe.ui.form.on('Visiting', {
	onload(frm) {
		function onPositionReceived(position) {
			let longitude = position.coords.longitude;
			let latitude = position.coords.latitude;
			frm.set_value('longitude', longitude);
			frm.set_value('latitude', latitude);
			fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
				.then(response => response.json())
				.then(data => {
					let address = data['results'][0].formatted;
					frm.set_value('current_address', address);
				})
				.catch(err => console.log(err));
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		}

		function locationNotReceived(positionError) {
			console.log(positionError);
		}

		if (frm.doc.longitude && frm.doc.latitude) {
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		} else {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(onPositionReceived, locationNotReceived, { enableHighAccuracy: true });
			} else {
				frappe.msgprint('Pleas Enable the Location Service');
			}
		}
	}
});


/* Validating if the location service is off. */
frappe.ui.form.on('Visiting', {
	before_save: function (frm) {
		if (!frm.doc.longitude && !frm.doc.latitude) {
			frappe.msgprint('Pleas Enable the Location Service');
		}
	}
});
