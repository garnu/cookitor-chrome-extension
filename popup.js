var cookies;

function loadSession(name, content){
  $('#session-name').html(name);
  $('#content').html(content);
  $.ajax({
    type: 'POST',
    url: $('#processing-form').attr('action'),
    data: {
      'content': content,
      'no_layout': 1,
      'mode': 'auto',
      'version': chrome.app.getDetails().version,
      'name': 'Cookitor 4 Chrome'
    },
    success: function(data) {
      $('#response').html(data);
      initializeToolbar();
      $('#response').removeClass('error');
    },
    error: function(jqXHR, textStatus, errorThrown) {
      var error = "An error occured. Please retry later.";
      if(jqXHR.responseText) {
        error = jqXHR.responseText;
      }
      $('#response').html(error);
      $('#response').addClass('error');
    }
  });
}

function flasher(message){
  $('#flasher').html(message);
  $('#flasher').show();
}

function multipleSessions(){
  flasher("Multiple session cookies are available for this domain.");
  var sessionList = $('<ul></ul>');
  $.each(cookies, function(index, cookie){
    sessionList.append(
      $("<li><a>" + cookie.name + "</a></li>")
    );
  });
  $('#session-list').html(sessionList);
  $('#session-list a').click(function() {
    var name = $(this).html();
    $.each(cookies, function(index, cookie){
      if(name == cookie.name){
        loadSession(cookie.name, cookie.value);
      }
    });
  });
}

function initializeToolbar(){
  $('#raw').hide();
  $('#highlight-button').click(function() {
    $('#raw').hide();
    $('#raw-button').removeClass('selected');
    $('#highlight-button').addClass('selected');
    $('#highlighted').show();
  });
  $('#raw-button').click(function() {
    $('#highlighted').hide();
    $('#highlight-button').removeClass('selected');
    $('#raw-button').addClass('selected');
    $('#raw').show();
  });
}

chrome.extension.sendRequest({command: 'fetch'}, function(response){
  cookies = response.cookies;
  if(cookies) {
    switch(cookies.length) {
    case 0:
      flasher("No session cookie is available for this domain.");
      break;
    default:
      multipleSessions();
    case 1:
      loadSession(cookies[0].name, cookies[0].value);
    }
  } else {
    flasher("An error occured while reading the session cookies.");
  }
});

$(document).ready(function() {
  initializeToolbar();
  $('#processing-form .decode').click(function(e) {
    loadSession("Custom", $('#content').val());
    e.preventDefault();
  });
});
