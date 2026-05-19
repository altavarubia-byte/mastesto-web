import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(
 process.env.RESEND_API_KEY
);

export async function POST(req: Request){

try{

const {asunto,mensaje,adminEmail}
=await req.json();

const supabaseAdmin=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);


const {data:admin}=await supabaseAdmin
.from("profiles")
.select("role")
.eq("email",adminEmail)
.single();


if(admin?.role!=="admin"){

return NextResponse.json(
{error:"No autorizado"},
{status:403}
)

}


const {data:usuarios}=await supabaseAdmin

.from("usuarios_marketing")
.select("email");


const emails=
usuarios?.map(
u=>u.email
)||[];


if(emails.length===0){

return NextResponse.json({
enviados:0
})

}


await resend.emails.send({

from:
'Mastesto <noreply@mastesto.es>',

to:emails,

subject:asunto,

html:`

<div style="background:#050505;color:white;padding:30px;font-family:Arial">

<h1 style="color:#ea580c">
MASTESTO
</h1>

<p>

${mensaje.replace(/\n/g,"<br/>")}

</p>

<hr/>

<p style="font-size:12px;color:#888">

Recibes este correo porque aceptaste comunicaciones comerciales.

Puedes darte de baja desde perfil.

</p>

</div>

`

});


return NextResponse.json({
enviados:emails.length
});


}catch{

return NextResponse.json(
{error:"Error"},
{status:500}
)

}

}
