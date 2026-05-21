'use client';

export default function BotonBorrarBlog({
  id,
  titulo,
  imagen_path
}:{
  id:string;
  titulo:string;
  imagen_path?:string;
}){

async function borrar(){

const ok=confirm(
`¿Eliminar "${titulo}"?`
);

if(!ok)return;

const res=await fetch(
'/api/admin/borrar-blog',
{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify({
id,
imagen_path
})
}
);

if(res.ok){

window.location.href = "/blog";

}else{

alert('Error eliminando');

}

}

return(

<button
onClick={borrar}
className="
mt-5
w-full
bg-red-600/10
border
border-red-600/30
rounded-xl
py-3
text-red-500
uppercase
text-[9px]
font-black
hover:bg-red-600
hover:text-white
transition-all
"
>

Eliminar ⚠️

</button>

)

}
