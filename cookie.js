if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

function fetch(sendResponse){
  chrome.tabs.getSelected(null, function(tab) {
    var matches = tab.url.match(/.*:\/\/([^:\/]+)/);
    var domain = domain = matches && matches[1];
    chrome.cookies.getAll({domain: domain}, function(cookies) {
      var sessionCookies = new Array();
      for(var i=0; i < cookies.length; i++) {
        if(cookies[i].value.match(/--[a-f0-9]+$/)) {
          sessionCookies.push(cookies[i]);
        }
      }
      sendResponse({cookies: sessionCookies}); 
    });
  });
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request.command=='fetch') {
      fetch(sendResponse);
    }
});