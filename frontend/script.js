const API_URL = "http://localhost:5000";

function showSignup() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("signupBox").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("signupBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

async function signup() {
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!username || !password) {
        document.getElementById("signupMessage").textContent =
            "Enter username and password";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        document.getElementById("signupMessage").textContent = data.message;

        if (response.ok) {
            showLogin();
        }
    } catch (error) {
        console.error(error);
        document.getElementById("signupMessage").textContent =
            "Cannot connect to backend";
    }
}

async function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("username", data.username);

            window.location.href = "character.html";
        } else {
            document.getElementById("loginMessage").textContent =
                data.message;
        }
    } catch (error) {
        console.error(error);
        document.getElementById("loginMessage").textContent =
            "Cannot connect to backend";
    }
}

async function chooseCharacter(characterClass) {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/character`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: Number(userId),
                characterClass
            })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("characterClass", characterClass);
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("characterMessage").textContent =
                data.message;
        }
    } catch (error) {
        console.error(error);
        document.getElementById("characterMessage").textContent =
            "Cannot connect to backend";
    }
}

async function loadPlayerData() {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    const response = await fetch(`${API_URL}/player/${userId}`);
    const player = await response.json();

    document.getElementById("username").textContent = player.username;
    document.getElementById("navUsername").textContent = player.username;
    document.getElementById("level").textContent = player.level;
    document.getElementById("xp").textContent = player.xp;
    document.getElementById("coins").textContent = player.coins;
    document.getElementById("streak").textContent = player.streak;

    document.getElementById("characterClass").textContent =
        player.character_class || "Not selected";

    document.getElementById("strength").textContent = player.strength || 0;
    document.getElementById("intelligence").textContent =
        player.intelligence || 0;
    document.getElementById("agility").textContent = player.agility || 0;

    const progress = player.xp % 100;

    document.getElementById("xpText").textContent =
        `${progress} / 100 XP`;

    document.getElementById("progressBar").style.width =
        `${progress}%`;
}

async function addQuest() {
    const userId = sessionStorage.getItem("userId");

    const title = document.getElementById("newQuestTitle").value.trim();
    const category = document.getElementById("newQuestCategory").value;
    const xp = Number(document.getElementById("newQuestXP").value);
    const coins = Number(document.getElementById("newQuestCoins").value);

    if (!title) {
        document.getElementById("questMessage").textContent =
            "Enter a quest title";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/quests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: Number(userId),
                title,
                category,
                xp,
                coins
            })
        });

        const data = await response.json();

        document.getElementById("questMessage").textContent = data.message;

        if (response.ok) {
            document.getElementById("newQuestTitle").value = "";
            loadQuests();
        }
    } catch (error) {
        console.error(error);
        document.getElementById("questMessage").textContent =
            "Could not add quest";
    }
}

async function loadQuests() {
    const userId = sessionStorage.getItem("userId");

    if (!userId || !document.getElementById("questList")) {
        return;
    }

    const response = await fetch(`${API_URL}/quests/${userId}`);
    const quests = await response.json();

    const questList = document.getElementById("questList");
    questList.innerHTML = "";

    if (quests.length === 0) {
        questList.innerHTML = "<p>No quests created yet.</p>";
        return;
    }

    quests.forEach((quest) => {
        const item = document.createElement("div");
        item.className = "quest-item";

        if (quest.completed === 1) {
            item.classList.add("completed");
        }

        item.innerHTML = `
            <div>
                <strong>${quest.title}</strong>
                <p>${quest.category} | ${quest.xp} XP | ${quest.coins} Coins</p>
            </div>
            ${
                quest.completed === 0
                    ? `<button onclick="completeQuest(${quest.id})">
                        Complete
                       </button>`
                    : "<span>Completed ✅</span>"
            }
        `;

        questList.appendChild(item);
    });
}

async function completeQuest(questId) {
    try {
        const response = await fetch(
            `${API_URL}/quests/${questId}/complete`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            await loadPlayerData();
            await loadQuests();
        }
    } catch (error) {
        console.error(error);
        alert("Could not complete quest");
    }
}

async function loadRewards() {
    const rewardsList = document.getElementById("rewardsList");

    if (!rewardsList) {
        return;
    }

    const response = await fetch(`${API_URL}/rewards`);
    const rewards = await response.json();

    rewardsList.innerHTML = "";

    rewards.forEach((reward) => {
        const item = document.createElement("div");
        item.className = "reward-item";

        item.innerHTML = `
            <span>${reward.name} - ${reward.cost} coins</span>
            <button onclick="buyReward(${reward.id})">Buy</button>
        `;

        rewardsList.appendChild(item);
    });
}

async function buyReward(rewardId) {
    const userId = sessionStorage.getItem("userId");

    const response = await fetch(`${API_URL}/rewards/${rewardId}/buy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: Number(userId)
        })
    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
        await loadPlayerData();
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("level")) {
        loadPlayerData();
        loadQuests();
        loadRewards();
    }
});