// Shorthad DOM referencers
$ = (n) => document.querySelector(n);
$$ = (n) => document.querySelectorAll(n);

// Used to toggle elements
function HideShowDOM(o) {
    if (o.style.display != "none") o.style.display = "none";
    else o.style.display = "inline-block";
}

function ToggleStyle(o, s) {
    o.children[0].classList.toggle(s);
}