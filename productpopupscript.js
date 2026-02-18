// show popup after 2 seconds
setTimeout(function(){
    document.getElementById("mc_embed_shell").style.display ="flex"
},2000);

// close popup when X is clicked
document.querySelector(".close-popup").addEventListener("click",function(){
    document.getElementById("mc_embed_shell").style.display ="none";
})

// close popup when clicking outside content
document.getElementById("mc_embed_shell").addEventListener("click", function(e){
    if(e.target=== this){ 
        this.style.display ="none";     
    }
}); 
         