// show after 5 seconds
setTimeout(function(){
    document.getElementById("promo").style.display = "flex";
}, 5000);

// close function
function closePromo() {
    document.getElementById("promo").style.display = "none";
}

// show popup after 15seconds
setTimeout(function(){
    document.getElementById("mc_embed_shell").style.display ="flex"
},15000);

// close popup when X is clicked
document.querySelector(".close-btn").addEventListener("click",function(){
    document.getElementById("mc_embed_shell").style.display ="none";
})

// close popup when clicking outside content
document.getElementById("mc_embed_shell").addEventListener("click", function(e){
    if(e.target=== this){ 
        this.style.display ="none";     
    }
}); 