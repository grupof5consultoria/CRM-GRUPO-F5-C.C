import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domínios do sistema Odonto Pulse — entram direto no login
const SYSTEM_DOMAINS = [
  'odontopulsef5.com.br',
  'www.odontopulsef5.com.br',
]

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  // Acesso pela raiz "/" no domínio do sistema → redireciona para login
  if (SYSTEM_DOMAINS.includes(host)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
