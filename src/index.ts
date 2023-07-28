async function init() {
    miro.board.ui.on('icon:click', async () => {
        if (!localStorage.openaiApiKey) {
            miro.board.ui.openModal({
                url: 'modal.html',
                width: 800,
                height: 680,
                fullscreen: false,
            });

            while (!localStorage.openaiApiKey) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            await miro.board.ui.closeModal();
        }

        await miro.board.ui.openPanel({url: 'app.html'});
    });
}

init();

export {}