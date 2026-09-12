const API_URL = "http://localhost:5000";


// ==================================================
// SIGNUP
// ==================================================

async function signup() {

    const username =
        document.getElementById("signupUsername").value.trim();

    const password =
        document.getElementById("signupPassword").value;


    const message =
        document.getElementById("signupMessage");


    if (!username || !password) {

        message.textContent =
            "❌ Please enter username and password.";

        return;

    }


    if (password.length < 4) {

        message.textContent =
            "❌ Password must be at least 4 characters.";

        return;

    }


    try {

        const response = await fetch(
            `${API_URL}/signup`,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    username: username,

                    password: password

                })

            }
        );


        const data =
            await response.json();


        message.textContent =
            data.message;


        if (response.ok) {

            document.getElementById(
                "signupUsername"
            ).value = "";

            document.getElementById(
                "signupPassword"
            ).value = "";

        }


    } catch (error) {

        console.log(error);

        message.textContent =
            "❌ Cannot connect to backend.";

    }

}



// ==================================================
// LOGIN
// ==================================================

async function login() {

    const username =
        document.getElementById("loginUsername").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    const message =
        document.getElementById("loginMessage");


    if (!username || !password) {

        message.textContent =
            "❌ Please enter username and password.";

        return;

    }


    try {

        const response = await fetch(
            `${API_URL}/login`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    username: username,

                    password: password

                })

            }
        );


        const data =
            await response.json();


        message.textContent =
            data.message;


        if (response.ok) {


            // Save user information

            localStorage.setItem(
                "userId",
                data.userId
            );


            localStorage.setItem(
                "username",
                data.username
            );


            // Open dashboard

            setTimeout(() => {

                window.location.href = "character.html";

            }, 800);

        }


    } catch (error) {

        console.log(error);

        message.textContent =
            "❌ Cannot connect to backend.";

    }

}



// ==================================================
// LOGOUT
// ==================================================

function logout() {

    localStorage.removeItem("userId");

    localStorage.removeItem("username");

    localStorage.removeItem("level");

    localStorage.removeItem("xp");

    localStorage.removeItem("coins");

    localStorage.removeItem("streak");


    window.location.href =
        "index.html";

}



// ==================================================
// DASHBOARD USER
// ==================================================

function loadUser() {

    const username =
        localStorage.getItem("username");


    if (!username) {

        window.location.href =
            "index.html";

        return;

    }


    const usernameElement =
        document.getElementById("username");


    const navUsername =
        document.getElementById("navUsername");


    if (usernameElement) {

        usernameElement.textContent =
            username;

    }


    if (navUsername) {

        navUsername.textContent =
            username;

    }

}



// ==================================================
// GAME DATA
// ==================================================

let level =
    Number(localStorage.getItem("level")) || 1;


let xp =
    Number(localStorage.getItem("xp")) || 0;


let coins =
    Number(localStorage.getItem("coins")) || 0;


let streak =
    Number(localStorage.getItem("streak")) || 0;



// ==================================================
// XP REQUIRED
// ==================================================

function getRequiredXP() {

    return Math.floor(
        100 * Math.pow(level, 1.5)
    );

}



// ==================================================
// UPDATE DASHBOARD
// ==================================================

function updateDashboard() {


    const levelElement =
        document.getElementById("level");

    const xpElement =
        document.getElementById("xp");

    const coinsElement =
        document.getElementById("coins");

    const streakElement =
        document.getElementById("streak");


    if (!levelElement) {

        return;

    }


    levelElement.textContent =
        level;


    xpElement.textContent =
        xp;


    coinsElement.textContent =
        coins;


    streakElement.textContent =
        streak;


    const requiredXP =
        getRequiredXP();


    const percentage =
        Math.min(
            (xp / requiredXP) * 100,
            100
        );


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    const xpText =
        document.getElementById(
            "xpText"
        );


    if (progressBar) {

        progressBar.style.width =
            percentage + "%";

    }


    if (xpText) {

        xpText.textContent =
            `${xp} / ${requiredXP} XP`;

    }


    // Save progress

    localStorage.setItem(
        "level",
        level
    );

    localStorage.setItem(
        "xp",
        xp
    );

    localStorage.setItem(
        "coins",
        coins
    );

    localStorage.setItem(
        "streak",
        streak
    );

}



// ==================================================
// COMPLETE QUEST
// ==================================================

function completeQuest(button, rewardXP) {


    if (button.disabled) {

        return;

    }


    // Add XP

    xp += rewardXP;


    // Give coins

    const rewardCoins =
        Math.floor(rewardXP / 2);


    coins += rewardCoins;


    // Increase streak

    streak++;


    // Check level up

    const requiredXP =
        getRequiredXP();


    if (xp >= requiredXP) {

        xp -= requiredXP;

        level++;


        alert(
            `🎉 LEVEL UP!\n\nYou reached Level ${level}!`
        );

    }


    // Disable quest

    button.disabled = true;

    button.textContent =
        "✓ Completed";


    button.style.opacity =
        "0.6";


    updateDashboard();


    alert(
        `⚔️ Quest Complete!\n\n+${rewardXP} XP\n+${rewardCoins} Coins`
    );

}



// ==================================================
// ADD QUEST MESSAGE
// ==================================================

function showQuestMessage() {

    alert(
        "📜 Custom Quest feature will be connected to the database in the next step!"
    );

}



// ==================================================
// BUY REWARD
// ==================================================

function buyReward(price) {


    if (coins >= price) {

        coins -= price;


        updateDashboard();


        alert(
            "🏆 Reward Purchased Successfully!"
        );

    } else {

        alert(
            `❌ Not enough coins!\n\nYou need ${price} coins.`
        );

    }

}



// ==================================================
// RUN WHEN PAGE LOADS
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadUser();

        updateDashboard();

    }
);
async function chooseCharacter(characterType) {

    const userId = localStorage.getItem("userId");

    const message =
        document.getElementById("characterMessage");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/character`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: userId,
                    characterType: characterType
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {

            localStorage.setItem(
                "characterType",
                characterType
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 700);
        }

    } catch (error) {

        console.log(error);

        message.textContent =
            "Cannot connect to backend.";

    }
}
async function loadPlayerData() {

    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/player/${userId}`
        );

        const player = await response.json();

        if (!response.ok) {
            alert(player.message);
            return;
        }

        document.getElementById("username").textContent =
            player.username;

        document.getElementById("navUsername").textContent =
            player.username;

        document.getElementById("level").textContent =
            player.level || 1;

        document.getElementById("xp").textContent =
            player.xp || 0;

        document.getElementById("coins").textContent =
            player.coins || 0;

        document.getElementById("streak").textContent =
            player.streak || 0;

        document.getElementById("strength").textContent =
            player.strength || 1;

        document.getElementById("intelligence").textContent =
            player.intelligence || 1;

        document.getElementById("health").textContent =
            player.health || 1;

        document.getElementById("creativity").textContent =
            player.creativity || 1;

        document.getElementById("strengthBar").style.width =
            `${Math.min((player.strength || 1) * 10, 100)}%`;

        document.getElementById("intelligenceBar").style.width =
            `${Math.min((player.intelligence || 1) * 10, 100)}%`;

        document.getElementById("healthBar").style.width =
            `${Math.min((player.health || 1) * 10, 100)}%`;

        document.getElementById("creativityBar").style.width =
            `${Math.min((player.creativity || 1) * 10, 100)}%`;

    } catch (error) {

        console.log(error);

        alert("Could not load player data.");

    }
}
