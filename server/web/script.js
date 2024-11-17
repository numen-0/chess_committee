let gameState = {
    isWhiteTeam: true,
    yourTurn: true,
    // pieces: null,   // {e2: w_rook, a2: w_bishop,}
    fen: null,
    moves: null,
};

let pageMetaData = {
    flipped: false,
    selectedPiece: null,
    // squares: null,  // {a1: square1, a2: square2,}
    promotionModal: null,
    promotionOptions: null,
    promoted_id: 0,
    turnDisplay: null,
    resultDisplay: null,
    resultText: null,
    encodingDisplay: null,
    percentage: null,
};

const promotionMap = {
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen"
};

// bridge /////////////////////////////////////////////////////////////////////
function setMoves(moves) {
    gameState.moves = moves;
    document.getElementById('game-moves').innerText = moves; // Display initial board state
}

async function makeCodeMove(move) { // move_uci
    const fromSquare = move.slice(0, 2);
    const toSquare = move.slice(2, 4);
    let promotionPiece = null;

    if (move.length === 5) {
        const promotionChar = move[4];
        promotionPiece = promotionMap[promotionChar];
    }

    const piece = document.querySelector(`div[data-position="${fromSquare}"]`).querySelector('.piece');
    const targetSquare = document.querySelector(`div[data-position="${toSquare}"]`);

    await makeMove(piece, targetSquare, promotionPiece);
}

// ai /////////////////////////////////////////////////////////////////////////
async function encodeBoard() {
    const response = await fetch('http://localhost:5002/encode_board', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fen: gameState.fen,
        })
    });
    const data = await response.json();
    pageMetaData.encodingDisplay.innerHTML = data.encoding;
}
async function gameEnd() {
    const response = await fetch('http://localhost:5002/game_end', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            moves: gameState.moves,
        })
    });
}
async function makeAiMove() {
    pageMetaData.turnDisplay.innerHTML = 'the committee is thinking...';
    const response = await fetch('http://localhost:5002/generate_moves', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            moves_start: gameState.moves,
        })
    });
    const data = await response.json();
    console.log(data);
    const size = data.db_size;
    const moves = data.top_moves;
    if (moves.length > 0) {
        for (const m of moves) {
            const response = await fetch(`http://localhost:5001/san_to_uci`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    san_move: m.move,
                    fen: gameState.fen,
                })
            });
            const d = await response.json();
            if (!d.is_valid) continue;

            const move = d.move_uci;
            const count = m.count

            console.log(`selected move: ${move}, count: ${count}`)
            pageMetaData.percentage.innerHTML = `${(count*100/size).toFixed(4)}%`;
            pageMetaData.turnDisplay.innerHTML = 'your turn';
            makeCodeMove(move)
            return;
        }
    }
    pageMetaData.percentage.innerHTML = "0%";
    pageMetaData.turnDisplay.innerHTML = 'your turn';
    makeRandomMove()
}

// referee ////////////////////////////////////////////////////////////////////
async function createGame() {
    pageMetaData.percentage.innerHTML = "100.0%"
    pageMetaData.turnDisplay.innerHTML = gameState.isWhiteTeam
                                            ? 'your turn' 
                                            : 'the committee is thinking...';
    const response = await fetch('http://localhost:5001/create_game', {
        method: 'GET',
    });
    const data = await response.json();
    gameState.fen = data.fen;
    setMoves(data.board_moves);
    encodeBoard();
}
async function gameOver() {
    const response = await fetch('http://localhost:5001/game_over', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fen: gameState.fen,
        })
    });
    const data = await response.json();
    console.log(data);

    if (!data.is_over) return false;

    gameEnd();

    const result = data.result;
    const winner = data.winner;
    const reason = data.reason;
    let msg = "";

    if (result === "1/2-1/2") {
        msg = `it's a draw (${reason})`;
    } else if (result === "1-0") {
        msg = "white wins by " + reason;
    } else if (result === "0-1") {
        msg = "black wins by " + reason;
    }
    pageMetaData.resultText.innerHTML = msg;
    pageMetaData.resultDisplay.style.display = 'block';

    return true;
}

async function checkMove(from, to) {
    const response = await fetch(`http://localhost:5001/check_move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fen: gameState.fen,
            from: from,
            to: to
        })
    });
    return response;
}

async function makeRandomMove() {
    try {
        const response = await fetch(`http://localhost:5001/random_move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: gameState.fen,
            })
        });

        const result = await response.json();
        console.log(result);

        const move = result.move_uci; // e.g., "e2e4" "b2b1q"
        makeCodeMove(move)
    } catch (error) {
        console.error("Error fetching random move:", error);
    }
}

// buttons ////////////////////////////////////////////////////////////////////
function initGame() {
    pageMetaData.resultDisplay.style.display = 'none';
    gameState.yourTurn = gameState.isWhiteTeam;
    gameState.moves = "";
    if (pageMetaData.selectedPiece) 
        pageMetaData.selectedPiece.classList.remove('selected');
    pageMetaData.selectedPiece = null;
    pageMetaData.promoted_id = 0;

    if (pageMetaData.flipped == gameState.isWhiteTeam) {
        pageMetaData.flipped = !gameState.isWhiteTeam;
        const flipButtonImg = document.getElementById('flipButton').querySelector('img');
        flipButtonImg.classList.toggle('flipped');
    }
    pageMetaData.turnDisplay.innerHTML = gameState.yourTurn
                                            ? 'your turn' 
                                            : 'the committee is thinking...';
    setupBoard()
    if (!gameState.yourTurn) makeAiMove();
}
async function restartGame() {
    await createGame();
    initGame();
}
function switchColor() {
    gameState.isWhiteTeam = !gameState.isWhiteTeam;
    if (pageMetaData.flipped == gameState.isWhiteTeam) {
        pageMetaData.flipped = !gameState.isWhiteTeam;
        const flipButtonImg = document.getElementById('flipButton').querySelector('img');
        flipButtonImg.classList.toggle('flipped');
    }
    const switchButtonImg = document.getElementById('switchButton').querySelector('img');
    switchButtonImg.classList.toggle('rotated');
    restartGame();
}
function flipBoard() {
    pageMetaData.flipped = !pageMetaData.flipped;
    const flipButtonImg = document.getElementById('flipButton').querySelector('img');
    flipButtonImg.classList.toggle('flipped');

    const board = document.querySelector('.chess-board');
    const squares = Array.from(board.children);

    const newSquares = new Array(64);

    for (let j = 0; j < 8; j++) {
        row = 7 - j;
        for (let i = 0; i < 8; i++) {
            col = 7 - i;
            newSquares[row * 8 + col] = squares[j * 8 + i];
        }
    }

    board.innerHTML = ''; // Clear the board
    newSquares.forEach(square => {
        board.appendChild(square);
    });
}

// board //////////////////////////////////////////////////////////////////////
function setupBoard(initialPositions = null) { // use the fen value
    const board = document.querySelector('.chess-board');
    board.innerHTML = ''; // Clear the board
    if (!initialPositions) {
        initialPositions = {
            // Black pieces
            'a8': 'black_rook', 'b8': 'black_knight', 'c8': 'black_bishop', 'd8': 'black_queen',
            'e8': 'black_king', 'f8': 'black_bishop', 'g8': 'black_knight', 'h8': 'black_rook',
            'a7': 'black_pawn', 'b7': 'black_pawn', 'c7': 'black_pawn', 'd7': 'black_pawn',
            'e7': 'black_pawn', 'f7': 'black_pawn', 'g7': 'black_pawn', 'h7': 'black_pawn',
            // White pieces
            'a1': 'white_rook', 'b1': 'white_knight', 'c1': 'white_bishop', 'd1': 'white_queen',
            'e1': 'white_king', 'f1': 'white_bishop', 'g1': 'white_knight', 'h1': 'white_rook',
            'a2': 'white_pawn', 'b2': 'white_pawn', 'c2': 'white_pawn', 'd2': 'white_pawn',
            'e2': 'white_pawn', 'f2': 'white_pawn', 'g2': 'white_pawn', 'h2': 'white_pawn',
        };
    }

    // Create the 8x8 grid and set up squares with alternating colors
    let row, col;
    for (let j = 0; j < 8; j++) {
        row = pageMetaData.flipped ? 1 + j : 8 - j;
        for (let i = 0; i < 8; i++) {
            col = pageMetaData.flipped ? 7 - i : i;
            const square = document.createElement('div');
            const position = String.fromCharCode(97 + col) + row;
            let color = (row + col) % 2 === 0;
            square.classList.add(color ? 'white' : 'black');
            square.dataset.position = position; // Set position as data attribute
            board.appendChild(square);

            if (initialPositions[position]) {
                const piece = document.createElement('img');
                piece.src = `/img/${initialPositions[position]}.svg`;
                piece.id = initialPositions[position] + "_" + position;
                piece.classList.add('piece');
                piece.draggable = true;
                square.appendChild(piece);
            }
        }
    }

    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(piece => {
        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('dragend', dragEnd);
        piece.addEventListener('click', () => {
            if (!gameState.yourTurn) {
                displayErrorMessage("It's not your turn")
                return;
            }
            if (!checkPieceTeam(piece)) {
                if (!pageMetaData.selectedPiece) displayErrorMessage("That's not your piece")
                return;
            }

            if (pageMetaData.selectedPiece === piece) {
                pageMetaData.selectedPiece.classList.remove('selected');
                pageMetaData.selectedPiece = null;
            } else {
                // Deselect the previous piece if another piece was selected
                if (pageMetaData.selectedPiece) pageMetaData.selectedPiece.classList.remove('selected');

                // Select the new piece
                pageMetaData.selectedPiece = piece;
                pageMetaData.selectedPiece.classList.add('selected');
            }
        });
    });
    const squares = document.querySelectorAll('.chess-board div');
    squares.forEach(square => {
        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', drop);
        square.addEventListener('click', async (e) => {
            if (pageMetaData.selectedPiece && square !== pageMetaData.selectedPiece.parentNode) {
                await makeMove(pageMetaData.selectedPiece, square)
                pageMetaData.selectedPiece.classList.remove('selected');
                pageMetaData.selectedPiece = null;
            }
        });
    });
}

// drag ///////////////////////////////////////////////////////////////////////
function dragStart(e) {
    const piece = e.target;
    const isPlayerPiece = checkPieceTeam(piece);
    if (!isPlayerPiece) {
        e.preventDefault(); // Prevent drag if not player's piece
        return;
    }
    if (pageMetaData.selectedPiece) {
        pageMetaData.selectedPiece.classList.remove('selected');
        pageMetaData.selectedPiece = null;
    }

    e.dataTransfer.setData('text/plain', piece.id);

    const dragImage = piece.cloneNode(true);
    dragImage.style.position = "absolute";
    dragImage.style.top = "-9999px"; // Place it off-screen temporarily
    document.body.appendChild(dragImage);

    // Set the drag image to appear under the cursor with the correct offset
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    piece.classList.add('dragging'); // Add dragging class

    // Clean up the cloned image after dragging
    e.target.addEventListener("dragend", () => {
        // Check if dragImage is still in the document before removing it
        if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
        }
    }, { once: true }); // Ensure this event fires only once
}

function dragEnd(e) {
    e.target.classList.remove('dragging'); // Remove dragging class
}

function dragOver(e) {
    e.preventDefault();
}

async function drop(e) {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(pieceId);
    let targetSquare = e.target;

    if (targetSquare.classList.contains('piece')) { 
        targetSquare = targetSquare.parentNode;
    }

    if (targetSquare === piece.parentNode) { return; }

    if (piece) { await makeMove(piece, targetSquare) }
}
// move piece /////////////////////////////////////////////////////////////////
async function movePiece(piece, targetSquare) {
    piece.classList.add('moving');

    const targetRect = targetSquare.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    const deltaX = targetRect.left - pieceRect.left;
    const deltaY = targetRect.top - pieceRect.top;

    piece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // if (existingPiece) { // Remove captured piece 
    // I dont know why but we promote a piece it cant be eaten... just do this
    // to patch my incompetence :)
        setTimeout(() => {
            targetSquare.innerHTML = ''; // Clear the square
            // targetSquare.removeChild(existingPiece);
        }, 200);
    // }
    setTimeout(() => { // Move piece to new square
        piece.classList.remove('moving');
        piece.style.transform = 'translate(0, 0)';
        targetSquare.appendChild(piece);
    }, 300);
}

async function makeMove(piece, targetSquare, promotionPiece = null) {
    const from = piece.parentNode.dataset.position;
    let   to   = targetSquare.dataset.position;

    const isPawn = piece.id.includes("pawn");
    const color = checkPieceTeam(piece)

    console.log(`${color ? "white" : "black"}: ${from} -> ${to}`)

    const promoting = promotionPiece !== null ||
        isPawn && (to[1] === (color ? "8" : "1"));
    // The writing of the castling indicates the square of departure of the king
    // and that of arrival of the king, not for the rook.

    const castling = piece.id.includes("king") &&
        (from === (color ? "e1" : "e8")) &&
        (to[0] === 'c' || to[0] === 'g')

            const rook = document.querySelector(
                `[data-position="${(to[0] === 'c' ? 'a' : 'h')}${to[1]}"]`
            ).querySelector('.piece');

    const eat = targetSquare.querySelector(".piece");

    const enPassant = isPawn &&         // pawn only move forward uless they eat
        !targetSquare &&                // we could check this more carefully
        (from[0] !== to[0]) &&          // but this works
        (to[1] === (color ? "6" : "3"));
    let name;

    if (promoting) {
        try {
            if (gameState.yourTurn) {
                promotionPiece = await showPromotionModal();
            }
            console.log(`\tpromoting to ${promotionPiece}`);
            name = `${color ? "white" : "black"}_${promotionPiece}`;
            pageMetaData.promoted_id += 1;

            // NOTE: for UCI adding the first char of the piece is enough,
            //       unless it's a knight because every body knows that knight
            //       starts with 'n' and not 'k'. (._.   )
            //       https://www.dcode.fr/uci-chess-notation
            const char = promotionPiece[0];
            to = to + (char === 'k' ? 'n' : char)
        } catch (cancelMessage) {
            console.log(cancelMessage);
            displayErrorMessage("Promotion canceled.");
            return;
        }
    }

    const moveData = {
        from: from,
        to: to,
    };
    console.log(moveData);

    try {
        const response = await checkMove(moveData.from, moveData.to)
        const result = await response.json();

        if (!result.valid) {
            displayErrorMessage(result.reason);
            return;
        }

        setMoves((!gameState.moves ? "" : gameState.moves + " ") + result.move)
        gameState.fen = result.fen;
        encodeBoard();
        
        if (castling) { // this is horrible (O_O)
            const rook = document.querySelector(
                `[data-position="${(to[0] === 'c' ? 'a' : 'h')}${to[1]}"]`
            ).querySelector('.piece');
            const rookTargetSquare = document.querySelector(
                `[data-position="${(to[0] === 'c' ? 'd' : 'f')}${to[1]}"]`
            );
            movePiece(piece, targetSquare);
            await movePiece(rook, rookTargetSquare)
        }
        await movePiece(piece, targetSquare);

        if (promoting) {
            console.log("promoting: " + piece.id + " to " + name);
            piece.id = name + "_promoted_" + pageMetaData.promoted_id;
            piece.src = `/img/${name}.svg`; // Update piece image
        } else if (enPassant) {
            console.log("\ten passant capture");

            const capturedSquare = document.querySelector(
                `[data-position="${to[0]}${parseInt(to[1])+(color ? -1 : +1)}"]`
            );
            if (capturedSquare) {
                capturedSquare.innerHTML = ''; // Clear the square
            }
        }

        if (await gameOver()) { return; }
    

        if (gameState.yourTurn) {
            setTimeout(() => {
                makeAiMove();
            }, 200);
        }
        gameState.yourTurn = !gameState.yourTurn;
    } catch (error) {
        console.error(error)
    }
}


// promotion //////////////////////////////////////////////////////////////////
// Display the modal and set up the callback
function showPromotionModal(callback) {
    pageMetaData.promotionModal.style.display = 'block';

    return new Promise((resolve, reject) => {
        // accept the promise if selected
        pageMetaData.promotionOptions.forEach(option => {
            option.onclick = () => {
                const promotionPiece = option.dataset.piece;
                resolve(promotionPiece);
                hidePromotionModal();
            };
        });
        // Reject the promise if canceled
        document.getElementById('closeModal').onclick = () => {
            reject('Promotion canceled');
            hidePromotionModal();
        };
    });
}

function hidePromotionModal() {
    pageMetaData.promotionModal.style.display = 'none';
    pageMetaData.promotionOptions.forEach(option => option.onclick = null); // Clear handlers
    document.getElementById('closeModal').onclick = null;
}

// utils //////////////////////////////////////////////////////////////////////
function checkPieceTeam(piece) {
    return piece.id.startsWith("white") == gameState.isWhiteTeam;
}

let errorTimeout;
function displayErrorMessage(message, duration = 2000) {
    const errorMsgElement = document.getElementById('error-msg');
    errorMsgElement.innerText = message;
    errorMsgElement.style.opacity = '1';

    if (errorTimeout) { // Clear the previous timeout if it exists
        clearTimeout(errorTimeout);
    }

    errorTimeout = setTimeout(() => { // Set a new timeout to hide the message
        errorMsgElement.style.opacity = '0';
    }, duration);
}


// do stuff ///////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    // buttons
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.getElementById('flipButton').addEventListener('click', flipBoard);
    document.getElementById('switchButton').addEventListener('click', switchColor);

    // promotion menu
    pageMetaData.promotionModal = document.getElementById('promotionModal');
    pageMetaData.promotionOptions = document.querySelectorAll('.promotion-option');
    // result menu
    pageMetaData.resultDisplay = document.getElementById('result-display');
    pageMetaData.resultText = document.getElementById('result');
    
    // display
    pageMetaData.turnDisplay = document.getElementById('turn-display');
    pageMetaData.encodingDisplay = document.getElementById('board-encoding');
    pageMetaData.percentage = document.getElementById('percentage');

    // init game
    createGame();
    initGame();
});
