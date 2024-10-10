
// import express from 'express';
// import cors from "cors";

// const app = express();
// app.use(cors());
// const key= process.env.KEY;
// console.log(key);


// app.get ("/api/key",(request, response) => { 
// response.json({ key : key });

//  });

// app.listen("1234", () => {
//     console.log("server on http://localhost:1234");
//     console.log("holas");
// });















import express from 'express';
import cors from "cors";
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
//const express = require('express');

app.use(cors());
app.use(bodyParser.json()); // Para manejar el JSON en las solicitudes


// Middleware para procesar JSON
app.use(express.json());

const key = process.env.KEY;
console.log(key);

// Ruta para obtener la clave
app.get("/api/key", (req, res) => { 
    res.json({ key: key });
});

// Ruta para obtener el historial de mensajes
app.get("/api/history", (req, res) => {
    fs.readFile('history.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading history file:", err);
            return res.status(500).json({ error: "Error reading history" });
        }
        const messages = JSON.parse(data || '[]');
        res.json(messages);
    });
});

// Ruta para guardar un mensaje en el historial

app.post("/api/history", (req, res) => {
    const { content, action } = req.body; // Asegúrate de recibir el contenido y la acción (encrypt/decrypt)

    fs.readFile('history.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading history file:", err);
            return res.status(500).json({ error: "Error reading history" });
        }

        const messages = JSON.parse(data || '[]');
        const newMessage = {
            content,
            action,
            date: new Date().toISOString() // Guarda la fecha del mensaje
        };

        messages.push(newMessage);

        fs.writeFile('history.json', JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error("Error writing history file:", err);
                return res.status(500).json({ error: "Error saving history" });
            }
            res.status(201).json(newMessage); // Devuelve el mensaje guardado
        });
    });
    
});

//Ruta para desencriptar un mensaje
app.post("/api/decrypt/:index", (req, res) => {
    const index = req.params.index;

    fs.readFile('history.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading history file:", err);
            return res.status(500).json({ error: "Error reading history" });
        }

        const messages = JSON.parse(data || '[]');
        const message = messages[index];

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        try {
            // Asumimos que el contenido está encriptado en Base64
            const decryptedMessage = atob(message.content);
            res.json({ message: decryptedMessage });
        } catch (decryptError) {
            console.error("Error desencriptando el mensaje:", decryptError);
            return res.status(500).json({ error: "Error desencriptando el mensaje" });
        }
    });
});





// Función simulada para desencriptar el mensaje
function decryptMessage(encrypted) {
    return atob(encrypted); // Supongamos que el mensaje fue encriptado usando Base64
}




// Ruta para eliminar un mensaje
app.delete("/api/delete/:index", (req, res) => {
    const index = req.params.index;

    fs.readFile('history.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading history file:", err);
            return res.status(500).json({ error: "Error reading history" });
        }

        let messages = JSON.parse(data || '[]');
        if (index < 0 || index >= messages.length) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Eliminar el mensaje
        messages.splice(index, 1);

        // Guardar el historial actualizado en el archivo JSON
        fs.writeFile('history.json', JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error("Error writing history file:", err);
                return res.status(500).json({ error: "Error saving history" });
            }
            res.status(200).json({ message: "Message deleted successfully" });
        });
    });
});







// Inicializar el servidor
app.listen("1234", () => {
    console.log("Server on http://localhost:1234");
    //console.log(`Server running on port ${port}`);
    console.log("holas");
});
