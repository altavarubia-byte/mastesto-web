import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // 1. Obtenemos la URL de la petición para extraer el código de verificación
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // 2. Creamos el cliente de Supabase usando las cookies
    const supabase = createRouteHandlerClient({ cookies })
    
    // 3. Intercambiamos el código por una sesión activa
    // Esto es lo que hace que el usuario aparezca como "Confirmado" en tu panel
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 4. Redirigimos al usuario a la página que quieras después de verificar
  // Normalmente al Dashboard o a la Home
  return NextResponse.redirect(new URL('/', request.url))
}
