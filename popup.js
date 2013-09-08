var cookies;

function loadSession(name, content, domain, key){
  $('#session-name').html(name);
  $('#session-domain').html(domain);
  $('#content').html(content);
  $('#key_value').val(key);
  $('#response').removeClass('error');
  $('#response').html('');
  var data = {
    'content': content,
    'no_layout': 1,
    'mode': 'auto',
    'version': chrome.app.getDetails().version,
    'name': 'Cookitor 5 Chrome'
  }
  if(key) {
    data.key_value = key;
    var keyName = storageKey(name, domain);
    localStorage.setItem(keyName, key);
  }
  $.ajax({
    type: 'POST',
    url: $('#processing-form').attr('action'),
    data: data,
    success: function(data) {
      $('#response').removeClass('error');
      $('#response').html(data);
      initializeToolbar();
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
        loadSession(cookie.name, cookie.value, cookie.domain, localStorage.getItem(storageKey(cookie.name, cookie.domain)));
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
    $('#highlighted').fadeIn();
  });
  $('#raw-button').click(function() {
    $('#highlighted').hide();
    $('#highlight-button').removeClass('selected');
    $('#raw-button').addClass('selected');
    $('#raw').fadeIn();
  });
}

function storageKey(name, domain) {
  return 'key-'+name+'-'+domain;
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
      if($('#key_value').val().length)
        localStorage.setItem('key-'+cookies[0].domain, $('#key_value').val());
      loadSession(cookies[0].name, cookies[0].value, cookies[0].domain, localStorage.getItem(storageKey(cookies[0].name, cookies[0].domain)));
    }
  } else {
    flasher("An error occured while reading the session cookies.");
  }
});

$(document).ready(function() {
  initializeToolbar();
  $('#content').on('change', function(){
    $('#session-name').html("Custom");
    $('#session-domain').html('unknown');
  });
  $('#processing-form .decode').click(function(e) {
    loadSession($('#session-name').html(), $('#content').val(), $('#session-domain').html(), $('#key_value').val());
    e.preventDefault();
  });
});
