import fetch from 'node-fetch';
import bcrypt from 'bcryptjs';

(async () => {
  const email = 'admin@5soptima.com';
  const password = 'admin123';

  try {
    // 1. Probar login directo
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log('🔐 Respuesta del login:', data);

    // 2. Generar hash para comparar
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    console.log('🔑 Nuevo hash generado para admin123:', hash);

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
})();