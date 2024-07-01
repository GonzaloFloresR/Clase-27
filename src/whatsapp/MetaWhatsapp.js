

let respuesta = await fetch("https://graph.facebook.com/v19.0/354376537758578/messages",{
    method:"POST",
    headers:{
        "Content-Type":"application/json",
        "Authorization": "Bearer EAAOzMmNjnW0BOyIdZCQYgCGZCcqhDVQRKVB5PihmJeEKycciFliTi9YZAiu4taISPkVyNZAVcTlrlZAD5MVDPP8vMZC5fXgKSZBIMmOYy53kVoZCF1ZBnHaDF272p7BxtCpkUQggFU31vSIoqtsPSmFsh1R5KqXkZBrBxARXGxoBLjT8LSsXp4xeSGXzYMXdbpaKNVen4UnbCXbL3SJ3ZChI5mgaCKxlwglGZBzL"
    },
    body: JSON.stringify(
        {
            "messaging_product": "whatsapp",
            "to": "56995623229",
            "type": "template",
            "template": {
                "name": "hello_world",
                "language": {
                    "code": "en_US"
                }
            }
        }
    )
});
let datos = respuesta.json();
console.log(JSON.stringify(datos));