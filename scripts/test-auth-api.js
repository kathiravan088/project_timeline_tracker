async function testLogin() {
    const url = 'http://localhost:3000/api/auth/callback/credentials';
    const body = new URLSearchParams({
        email: 'admin@trackflow.app',
        password: 'admin123',
        redirect: 'false',
        json: 'true',
        csrfToken: 'dummy' // Usually NextAuth requires a real CSRF token, but let's see the server response
    });

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testLogin();
