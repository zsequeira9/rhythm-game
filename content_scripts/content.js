
(function() {
  /*
  Check and set a global guard variable.
  If this content script is injected into the same page again,
  it will do nothing next time.
  */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;


  function insertVis() {
    const frame = document.createElement("iframe");
    frame.setAttribute("src", browser.runtime.getURL(`/index.html`));
    frame.setAttribute("style", "width: 100vw; height: 100vh;");
    document.body.appendChild(frame);
  }
  insertVis();

  function play() {
  console.log("Hello from content play")
    const request = new XMLHttpRequest();
    request.open("GET", browser.runtime.getURL("/public/test6.mp3"));
    request.responseType = "arraybuffer";
    request.onload = function() {
        console.log("sending message")
      browser.runtime.sendMessage({data: request.response})  
    };
  request.send();
  
}
play();
  

})();

