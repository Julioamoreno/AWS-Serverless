async function handler(event, context) {
    console.log('Evento.. ', JSON.stringify(event, null));

    return {
        hello: 'world',
    }
}