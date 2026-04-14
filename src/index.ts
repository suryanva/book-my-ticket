import { createServer } from 'node:http'
import "dotenv/config"
import { createApplication } from './app/index.js';


async function main() {
    try {
        const server = createServer(createApplication());
        const PORT: number = Number(process.env.PORT);

        server.listen(PORT, () => console.log(`Http server is running on PORT : ${PORT}`))

    } catch (error) {
        console.log(`Error starting the Server`);
        throw error

    }
}

process.on('SIGINT', () => {
    console.log("Shutting down server...");
    process.exit(0);
});

main();