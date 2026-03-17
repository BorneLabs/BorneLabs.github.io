document.addEventListener("DOMContentLoaded",()=>{

const tags=document.querySelectorAll(".tag-link");
const sections=document.querySelectorAll("section[id]");

function setActive(id){

tags.forEach(tag=>{
tag.classList.remove("active");

if(tag.getAttribute("href")==="#"+id){
tag.classList.add("active");
}

});

}

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top=section.offsetTop-120;

if(scrollY>=top){
current=section.getAttribute("id");
}

});

if(current)setActive(current);

});

});