var APP_ID = 0;
var APP_SECRET = 0;
var USER_ID = 0;
var USER_ACCESS_TOKEN = 0;
var TARGET_APP_USER_ACCESS_TOKEN = 0;
var APP_ACCESS_TOKEN = 0;

function facebookLogin(e) {

	FB.init({
      appId: '566396770112957',
    });  

	FB.login(function(response) {
		if (response.authResponse) {
			USER_ACCESS_TOKEN = FB.getAuthResponse()['accessToken'];
			FB.api('/me?fields=id,first_name', function(response) {
				bootstrap_alert('Login Success: Hey ' + response.first_name + '! Looking good!', 'success');
				USER_ID = response.id;
				populateApps();
			});
		} else {
			bootstrap_alert('Error: Failed to log in to Facebook.', 'danger');
		}
	});

	e.preventDefault();
}

function populateApps() {

	$('#panel_login').fadeOut(1000,function(){
        $("#logged_in_view").fadeIn(1000);
    });

	// Get a list of apps and populate the dropdown
	FB.api({method: 'fql.query', query: 'SELECT application_id, role FROM app_role WHERE developer_id = ' + USER_ID}, function(response) {
	    
	    response.forEach(function(object) {
	    	if (object.role == "administrators") {
	    		FB.api('/'+object.application_id, function(appResponse) {
	    				$("#app_menu").append('<li><a href="#" style="display:inline" value='+appResponse.id+'><img src="'+ appResponse.icon_url +'" style="float:left; margin-right:10px;"/>' + appResponse.name + ' (' + appResponse.id + ')</a></li>');
	    		});
	    	}
	    });    
	});

	$( '.dropdown-menu' ).on( 'click', 'a', function () {
		APP_ID = $(this).attr('value');
		var selText = $(this).html();
	  	$(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
	});
}

function populateRoles(e) {

	APP_SECRET = $("#app_secret").val();

	APP_ACCESS_TOKEN = APP_ID + "|" + APP_SECRET;

	// First empty the existing tables
	$("#roletable_administrators").find("tr:gt(0)").remove();
	$("#roletable_developers").find("tr:gt(0)").remove();
	$("#roletable_testers").find("tr:gt(0)").remove();
	$("#roletable_insights").find("tr:gt(0)").remove();

	bootstrap_alert('Fetching role information. Sit tight, girl!', 'info');

	$.get("https://graph.facebook.com/"+APP_ID+"/roles", 
			{ access_token: APP_ACCESS_TOKEN }
	).done(function(data) {
		 
		 var returnObj = data.data;
		 console.log(returnObj);

		 $.each(returnObj, function(i, user) {
		 	var roleTable = null;
		 	var roleType = null;

		 	if (user.role === "administrators") {
		 		roleType = "administrators";
				roleTable = $('#roletable_administrators tr:last');
			}
			else if (user.role === "testers") {
				roleType = "testers";
				roleTable = $('#roletable_testers tr:last');
			}
			else if (user.role === "developers") {
				roleType = "developers";
				roleTable = $('#roletable_developers tr:last');
			}
			else if (user.role === "insights users") {
				roleType = "insights";
				roleTable = $('#roletable_insights tr:last');
			}

	 		var uid = user.user;

	 		// Fetch basic details of each user
	 		$.get("https://graph.facebook.com/"+uid+'?fields=username,name,id', 
				{ access_token: APP_ACCESS_TOKEN }
				).done(function(userdata) {
					
					var profilePicture = '<img src="https://graph.facebook.com/'+userdata.id+'/picture?type=square"/>';
					
					roleTable.after('<tr><td>'+profilePicture+'</td><td><a href="https://www.facebook.com/'+userdata.username+'" target="_blank">' + userdata.name + '</a></td><td><a href="https://www.facebook.com/'+userdata.username+'">' + userdata.id + '</a></td><td><button type="button" value="'+ userdata.id +'" class="btn btn-danger app_remove_user_'+roleType+'"><span class="glyphicon glyphicon-remove-sign"></span> Remove</button></td></tr>');
				
					if (i == returnObj.length-1) {
						$(".app_remove_user_administrators").bind('click', removeUserAdministrators);
						$(".app_remove_user_testers").bind('click', removeUserTesters);
						$(".app_remove_user_developers").bind('click', removeUserDevelopers);
						$(".app_remove_user_insights").bind('click', removeUserInsights);
						bootstrap_alert('Success: Fetched role information.', 'success');
					}

				});
		 });
		
		 
	}).fail(function(data) {
		bootstrap_alert('Error: Failed to fetch role information.', 'danger');
	});

	if (e != null) {
		e.preventDefault();
	}
}


function bootstrap_alert(message, alerttype) {
	$('#alert_placeholder').html('<div class="alert alert-dismissable alert-' + alerttype + '"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span><strong>'+message+'<strong></span></div>');
	$('#alert_placeholder').alert();
}

function bulkChangeAdministratorsAdd(e) {
	bulkChangeProcess('administrators', true, $(this));
	e.preventDefault();
}

function bulkChangeAdministratorsRemove(e) {
	bulkChangeProcess('administrators', false, $(this));
	e.preventDefault();
}

function bulkChangeDevelopersAdd(e) {
	bulkChangeProcess('developers', true, $(this));
	e.preventDefault();
}

function bulkChangeDevelopersRemove(e) {
	bulkChangeProcess('developers', false, $(this));
	e.preventDefault();
}

function bulkChangeTestersAdd(e) {
	bulkChangeProcess('testers', true, $(this));
	e.preventDefault();
}

function bulkChangeTestersRemove(e) {
	bulkChangeProcess('testers', false, $(this));
	e.preventDefault();
}

function bulkChangeInsightsAdd(e) {
	bulkChangeProcess('insights users', true, $(this));
	e.preventDefault();
}

function bulkChangeInsightsRemove(e) {
	bulkChangeProcess('insights users', false, $(this));
	e.preventDefault();
}

function bulkChangeProcess(theRole, add, button) {

	TARGET_APP_USER_ACCESS_TOKEN = $('#app_user_access_token').val();

	if (theRole === 'insights users') {
		entered = $('#bulk_insights_text').val();
	}
	else {
		entered = $('#bulk_'+theRole+'_text').val();
	}

	button.button('loading');
	
	lines = entered.split(/[\n,]/);

	successes = new Array(lines.length);

	$.each(lines, function(i, line) {
		
		successes[i] = false;

		if(line.length == 0) {return true;}
		
		userid = line.replace(/\D/g,'');
		
		if (add) {
			$.ajax({
			    url: 'https://graph.facebook.com/' + APP_ID + '/roles',
			    type: 'POST',
			    data: {access_token: TARGET_APP_USER_ACCESS_TOKEN, user: userid, role: theRole},
			    success: function(result) {
			    	console.log('Updated role information: ' + result);
			    	successes[i] = true;

			    	allReady = true;
			    	for (x=0; x<successes.length; x++) {
			    		if (successes[x] === false) {
			    			allReady=false;
			    		}
			    	}

			    	if (allReady) {
			    		bootstrap_alert('Success: Roles are changed. Users must accept invites to see changes!', 'success');
			    		button.button('success');
			    	}
			    },
			    error: function(x,e){
		        	bootstrap_alert('Error: Failed to update role information.', 'danger');
					button.button('error');
		     	} 
			});
		}
		else {
			$.ajax({
			    url: 'https://graph.facebook.com/' + APP_ID + '/roles',
			    type: 'DELETE',
			    data: {access_token: TARGET_APP_USER_ACCESS_TOKEN, user: userid},
			    success: function(result) {
			    	console.log('Updated role information: ' + result);
			    	successes[i] = true;

			    	allReady = true;
			    	for (x=0; x<successes.length; x++) {
			    		if (successes[x] === false) {
			    			allReady=false;
			    		}
			    	}

			    	if (allReady) {
			    		bootstrap_alert('Success: Users removed!', 'success');
			    		button.button('success');
			    	}
			    },
			    error: function(x,e){
		        	bootstrap_alert('Error: Failed to update role information.', 'danger');
					button.button('error');
		     	} 
			});

		}

	});

	if (theRole === 'insights users') {
		$('#bulk_insights_text').val('');
	}
	else {
		$('#bulk_'+theRole+'_text').val('');
	}
}


function removeUserProcess(role, userid, tableentry) {
	TARGET_APP_USER_ACCESS_TOKEN = $('#app_user_access_token').val();

	$.ajax({
	    url: 'https://graph.facebook.com/' + APP_ID + '/roles',
	    type: 'DELETE',
	    data: {access_token: TARGET_APP_USER_ACCESS_TOKEN, user: userid},
	    success: function(result) {

	    	$(tableentry).closest('tr').fadeOut(1000);

	        bootstrap_alert('Success: Altered role information. They\'re history!', 'success');
	    },
	    error: function(x,e){
        	bootstrap_alert('Error: Failed to alter role information.', 'danger');
     	} 
	});
}


function removeUserAdministrators(e) {
	removeUserProcess('administrators', $(this).val(), $(this));
	e.preventDefault();	
}

function removeUserDevelopers(e) {
	removeUserProcess('developers', $(this).val(), $(this));
	e.preventDefault();	
}

function removeUserTesters(e) {
	removeUserProcess('testers', $(this).val(), $(this));
	e.preventDefault();	
}

function removeUserInsights(e) {
	removeUserProcess('insights users', $(this).val(), $(this));
	e.preventDefault();	
}



function findAppSecret(e) {
	window.open('https://developers.facebook.com/apps/' + APP_ID + '/summary/');
	e.preventDefault();
}

function findUserAccessToken(e) {
	window.open('https://developers.facebook.com/tools/explorer/' + APP_ID);
	e.preventDefault();
}


$(document).ready(function() {

	if (window.location.protocol != "https:")
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

	$("#logged_in_view").hide();
    
	$("#fblogin").bind('click', facebookLogin);

	$("#app_find_secret").bind('click', findAppSecret);

	$("#app_find_user_access_token").bind('click', findUserAccessToken);

    $("#app_populate_roles").bind('click', populateRoles);
    
    $("#bulk_administrators_add_go").bind('click', bulkChangeAdministratorsAdd);
    $("#bulk_administrators_remove_go").bind('click', bulkChangeAdministratorsRemove);

	$("#bulk_developers_add_go").bind('click', bulkChangeDevelopersAdd);
    $("#bulk_developers_remove_go").bind('click', bulkChangeDevelopersRemove);

	$("#bulk_testers_add_go").bind('click', bulkChangeTestersAdd);
    $("#bulk_testers_remove_go").bind('click', bulkChangeTestersRemove);

	$("#bulk_insights_add_go").bind('click', bulkChangeInsightsAdd);
    $("#bulk_insights_remove_go").bind('click', bulkChangeInsightsRemove);

});