/* =====================================================
   MISSION 75 SETTINGS
===================================================== */

const START_WEIGHT = 98.5;

const GOAL_WEIGHT = 75;

const CALORIE_GOAL = 2000;

const PROTEIN_GOAL = 120;

const WATER_GOAL = 3.5;

const STEP_GOAL = 8000;

const WORKOUT_GOAL = 300;


/* =====================================================
   CALORIE PROJECTION SETTINGS
===================================================== */

/*
   IMPORTANT:

   This is being treated as your baseline
   maintenance BEFORE separately adding
   workout calories.

   If your 2700 already includes exercise,
   don't add workout calories again.
*/

const MAINTENANCE_CALORIES = 2700;


/*
   Approximation:
   7700 kcal ≈ 1 kg

   This is an estimate, not a guarantee.
*/

const CALORIES_PER_KG = 7700;


/* =====================================================
   STORAGE
===================================================== */

function getData() {

    const saved =
        localStorage.getItem(
            "mission75Data"
        );


    if (!saved) {

        return [];

    }


    try {

        return JSON.parse(saved);

    }

    catch (error) {

        console.log(
            "Storage error:",
            error
        );

        return [];

    }

}


function saveData(data) {

    localStorage.setItem(
        "mission75Data",
        JSON.stringify(data)
    );

}


/* =====================================================
   DATE
===================================================== */

function today() {

    const d =
        new Date();

    return d.toISOString()
        .split("T")[0];

}


/* =====================================================
   NAVIGATION
===================================================== */

function showPage(
    page,
    button
) {

    document
        .querySelectorAll(".page")
        .forEach(p => {

            p.classList.remove(
                "active"
            );

        });


    document
        .getElementById(page)
        .classList.add(
            "active"
        );


    document
        .querySelectorAll(".nav button")
        .forEach(b => {

            b.classList.remove(
                "active"
            );

        });


    button.classList.add(
        "active"
    );


    if (
        page === "progressPage"
    ) {

        setTimeout(
            drawChart,
            50
        );

    }

}


/* =====================================================
   SAVE TODAY
===================================================== */

function saveToday() {

    const weight =
        parseFloat(
            document.getElementById(
                "weightInput"
            ).value
        );


    const calories =
        parseInt(
            document.getElementById(
                "calorieInput"
            ).value
        ) || 0;


    const workout =
        parseInt(
            document.getElementById(
                "workoutInput"
            ).value
        ) || 0;


    const protein =
        parseInt(
            document.getElementById(
                "proteinInput"
            ).value
        ) || 0;


    const water =
        parseFloat(
            document.getElementById(
                "waterInput"
            ).value
        ) || 0;


    const steps =
        parseInt(
            document.getElementById(
                "stepsInput"
            ).value
        ) || 0;


    if (!weight) {

        alert(
            "Please enter your weight."
        );

        return;

    }


    /* =========================================
       XP
    ========================================== */

    let xp = 0;


    if (
        calories > 0 &&
        calories <= CALORIE_GOAL
    ) {

        xp += 25;

    }


    if (
        protein >= PROTEIN_GOAL
    ) {

        xp += 25;

    }


    if (
        water >= WATER_GOAL
    ) {

        xp += 25;

    }


    if (
        steps >= STEP_GOAL
    ) {

        xp += 25;

    }


    if (
        workout >= WORKOUT_GOAL
    ) {

        xp += 25;

    }


    const entry = {

        date:
            today(),

        weight:
            weight,

        calories:
            calories,

        workout:
            workout,

        protein:
            protein,

        water:
            water,

        steps:
            steps,

        xp:
            xp

    };


    let data =
        getData();


    /*
       Update today's entry
       if it already exists.
    */

    const index =
        data.findIndex(
            x =>
            x.date ===
            entry.date
        );


    if (
        index >= 0
    ) {

        data[index] =
            entry;

    }

    else {

        data.push(
            entry
        );

    }


    data.sort(
        (a,b) =>
        new Date(a.date) -
        new Date(b.date)
    );


    saveData(data);


    updateDashboard();


    alert(
        "Mission updated! 🔥"
    );

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const data =
        getData();


    if (
        !data.length
    ) {

        updateProjection();

        return;

    }


    const latest =
        data[
            data.length - 1
        ];


    /* WEIGHT */

    document.getElementById(
        "dashWeight"
    ).innerText =
        latest.weight.toFixed(1)
        + " kg";


    document.getElementById(
        "bigWeight"
    ).innerText =
        latest.weight.toFixed(1)
        + " kg";


    /* REMAINING */

    const remaining =
        Math.max(
            0,
            latest.weight -
            GOAL_WEIGHT
        );


    document.getElementById(
        "dashRemaining"
    ).innerText =
        remaining.toFixed(1)
        + " kg";


    /* PROGRESS */

    const total =
        START_WEIGHT -
        GOAL_WEIGHT;


    const lost =
        START_WEIGHT -
        latest.weight;


    let percent =
        (
            lost /
            total
        ) * 100;


    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    document.getElementById(
        "mainProgress"
    ).style.width =
        percent + "%";


    document.getElementById(
        "progressPercent"
    ).innerText =
        percent.toFixed(1)
        + "%";


    document.getElementById(
        "lostText"
    ).innerText =
        Math.max(
            0,
            lost
        ).toFixed(1)
        + " kg lost";


    /* TARGETS */

    setTarget(
        "calorieFill",
        "calorieText",
        latest.calories,
        CALORIE_GOAL
    );


    setTarget(
        "proteinFill",
        "proteinText",
        latest.protein,
        PROTEIN_GOAL,
        "g"
    );


    setTarget(
        "waterFill",
        "waterText",
        latest.water,
        WATER_GOAL,
        "L"
    );


    setTarget(
        "stepsFill",
        "stepsText",
        latest.steps,
        STEP_GOAL
    );


    setTarget(
        "workoutFill",
        "workoutText",
        latest.workout || 0,
        WORKOUT_GOAL,
        " kcal"
    );


    /* XP */

    let totalXP = 0;


    data.forEach(
        item => {

            totalXP +=
                item.xp || 0;

        }
    );


    document.getElementById(
        "dashXP"
    ).innerText =
        totalXP;


    document.getElementById(
        "todayXP"
    ).innerText =
        latest.xp +
        " XP";


    /* STREAK */

    const streak =
        getStreak(
            data
        );


    document.getElementById(
        "dashStreak"
    ).innerText =
        streak +
        " days";


    /* RANK */

    document.getElementById(
        "rank"
    ).innerText =
        getRank(
            totalXP
        );


    /* HISTORY */

    displayHistory(
        data
    );


    /* ACHIEVEMENTS */

    displayAchievements(
        data
    );


    /* ENERGY BALANCE */

    updateEnergyBalance(
        latest
    );


    /* PROJECTION */

    updateProjection();

}


/* =====================================================
   TARGET BARS
===================================================== */

function setTarget(
    barId,
    textId,
    value,
    goal,
    unit = ""
) {

    let percent =
        (
            value /
            goal
        ) * 100;


    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    document.getElementById(
        barId
    ).style.width =
        percent + "%";


    document.getElementById(
        textId
    ).innerText =
        value +
        " / " +
        goal +
        unit;

}


/* =====================================================
   ENERGY BALANCE
===================================================== */

function calculateDeficit(
    food,
    workout
) {

    /*
       Formula:

       Maintenance
       - Food
       + Workout

    */

    return (
        MAINTENANCE_CALORIES -
        food +
        workout
    );

}


function updateEnergyBalance(
    entry
) {

    const food =
        entry.calories || 0;


    const workout =
        entry.workout || 0;


    const deficit =
        calculateDeficit(
            food,
            workout
        );


    document.getElementById(
        "logFood"
    ).innerText =
        food;


    document.getElementById(
        "logWorkout"
    ).innerText =
        "+" +
        workout;


    document.getElementById(
        "logDeficit"
    ).innerText =
        deficit +
        " kcal";

}


/* =====================================================
   LEO PROJECTION
===================================================== */

function updateProjection() {

    const data =
        getData();


    let currentWeight =
        START_WEIGHT;


    if (
        data.length > 0
    ) {

        currentWeight =
            data[
                data.length - 1
            ].weight;

    }


    /*
       Use today's logged calories
       and workout when available.

       Otherwise use planned target:
       2000 calories and 0 workout.
    */

    let foodCalories =
        CALORIE_GOAL;


    let workoutCalories =
        0;


    if (
        data.length > 0
    ) {

        const latest =
            data[
                data.length - 1
            ];


        /*
           If calories were logged,
           use them.
        */

        if (
            latest.calories > 0
        ) {

            foodCalories =
                latest.calories;

        }


        workoutCalories =
            latest.workout || 0;

    }


    /* DAILY DEFICIT */

    const dailyDeficit =
        calculateDeficit(
            foodCalories,
            workoutCalories
        );


    /*
       Weekly energy deficit
    */

    const weeklyDeficit =
        dailyDeficit * 7;


    /*
       Estimated kg/week
    */

    const weeklyLoss =
        weeklyDeficit /
        CALORIES_PER_KG;


    /*
       Remaining kg
    */

    const remainingWeight =
        Math.max(
            0,
            currentWeight -
            GOAL_WEIGHT
        );


    /*
       Estimated days
    */

    let days = 0;


    if (
        dailyDeficit > 0 &&
        remainingWeight > 0
    ) {

        days =
            Math.ceil(
                (
                    remainingWeight *
                    CALORIES_PER_KG
                ) /
                dailyDeficit
            );

    }


    /* DISPLAY */

    document.getElementById(
        "maintenanceCalories"
    ).innerText =
        MAINTENANCE_CALORIES +
        " kcal";


    document.getElementById(
        "projectionFood"
    ).innerText =
        foodCalories +
        " kcal";


    document.getElementById(
        "projectionWorkout"
    ).innerText =
        "+" +
        workoutCalories +
        " kcal";


    document.getElementById(
        "dailyDeficit"
    ).innerText =
        dailyDeficit +
        " kcal";


    document.getElementById(
        "weeklyLoss"
    ).innerText =
        weeklyLoss.toFixed(2) +
        " kg/week";


    /* DATE */

    if (
        remainingWeight <= 0
    ) {

        document.getElementById(
            "daysRemaining"
        ).innerText =
            "GOAL REACHED 🎉";


        document.getElementById(
            "goalDate"
        ).innerText =
            "MISSION COMPLETE";


        return;

    }


    if (
        days > 0
    ) {

        document.getElementById(
            "daysRemaining"
        ).innerText =
            days +
            " days";


        const targetDate =
            new Date();


        targetDate.setDate(
            targetDate.getDate() +
            days
        );


        document.getElementById(
            "goalDate"
        ).innerText =
            targetDate.toLocaleDateString(
                undefined,
                {
                    day:
                        "numeric",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            );

    }

    else {

        document.getElementById(
            "daysRemaining"
        ).innerText =
            "N/A";


        document.getElementById(
            "goalDate"
        ).innerText =
            "No deficit";

    }

}


/* =====================================================
   STREAK
===================================================== */

function getStreak(
    data
) {

    if (
        !data.length
    ) {

        return 0;

    }


    let streak = 1;


    for (
        let i =
            data.length - 1;

        i > 0;

        i--
    ) {

        const current =
            new Date(
                data[i].date
            );


        const previous =
            new Date(
                data[i - 1].date
            );


        const difference =
            Math.round(
                (
                    current -
                    previous
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        if (
            difference === 1
        ) {

            streak++;

        }

        else {

            break;

        }

    }


    return streak;

}


/* =====================================================
   RANK
===================================================== */

function getRank(
    xp
) {

    if (
        xp >= 5000
    ) {

        return "MISSION 75 LEGEND 👑";

    }


    if (
        xp >= 2000
    ) {

        return "Elite Warrior 🏆";

    }


    if (
        xp >= 1000
    ) {

        return "Mission Warrior 🥇";

    }


    if (
        xp >= 500
    ) {

        return "Disciplined Warrior 🥈";

    }


    if (
        xp >= 250
    ) {

        return "Disciplined Warrior 🥉";

    }


    return "Recruit";

}


/* =====================================================
   HISTORY
===================================================== */

function displayHistory(
    data
) {

    const history =
        document.getElementById(
            "history"
        );


    history.innerHTML =
        "";


    if (
        !data.length
    ) {

        history.innerText =
            "No entries yet.";

        return;

    }


    [
        ...data
    ]
    .reverse()
    .forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "history-item";


            const workout =
                item.workout || 0;


            const deficit =
                calculateDeficit(
                    item.calories || 0,
                    workout
                );


            div.innerHTML = `

                <div>

                    <strong>
                        📅 ${item.date}
                    </strong>

                    <br><br>

                    <span
                        style="
                            color:#8c9991;
                        "
                    >

                        🔥 ${item.calories}

                        &nbsp;&nbsp;

                        🏋️ ${workout}

                        &nbsp;&nbsp;

                        💪 ${item.protein}g

                        &nbsp;&nbsp;

                        💧 ${item.water}L

                        &nbsp;&nbsp;

                        👟 ${item.steps}

                    </span>

                    <br><br>

                    <small
                        style="
                            color:#ffd43b;
                        "
                    >

                        ⚡ Deficit:
                        ${deficit} kcal

                    </small>

                </div>


                <div>

                    <div
                        class="history-weight"
                    >

                        ${item.weight.toFixed(1)}
                        kg

                    </div>

                    <small
                        style="
                            color:#b56cff;
                        "
                    >

                        ⭐ ${item.xp} XP

                    </small>

                </div>

            `;


            history.appendChild(
                div
            );

        }
    );

}


/* =====================================================
   ACHIEVEMENTS
===================================================== */

function displayAchievements(
    data
) {

    const box =
        document.getElementById(
            "achievementGrid"
        );


    box.innerHTML =
        "";


    const latest =
        data.length
        ? data[
            data.length - 1
        ]
        : null;


    const weight =
        latest
        ? latest.weight
        : START_WEIGHT;


    const achievements = [

        [
            "🚀",
            "First Step",
            "Log your first day",
            data.length >= 1
        ],

        [
            "🔥",
            "3 Day Streak",
            "Maintain 3 consecutive days",
            getStreak(data) >= 3
        ],

        [
            "💪",
            "Protein Master",
            "Hit 120g protein",
            data.some(
                x =>
                x.protein >=
                PROTEIN_GOAL
            )
        ],

        [
            "💧",
            "Hydration Hero",
            "Drink 3.5L water",
            data.some(
                x =>
                x.water >=
                WATER_GOAL
            )
        ],

        [
            "👟",
            "8K Walker",
            "Reach 8,000 steps",
            data.some(
                x =>
                x.steps >=
                STEP_GOAL
            )
        ],

        [
            "🏋️",
            "Workout Warrior",
            "Burn 300 workout calories",
            data.some(
                x =>
                (x.workout || 0) >=
                WORKOUT_GOAL
            )
        ],

        [
            "⚖️",
            "First 5 KG",
            "Lose your first 5 kg",
            weight <=
            START_WEIGHT - 5
        ],

        [
            "🏆",
            "Mission 75",
            "Reach 75 kg",
            weight <=
            GOAL_WEIGHT
        ]

    ];


    achievements.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "achievement";


            if (
                item[3]
            ) {

                div.classList.add(
                    "unlocked"
                );

            }

            else {

                div.classList.add(
                    "locked"
                );

            }


            div.innerHTML = `

                <div
                    class="achievement-icon"
                >
                    ${item[0]}
                </div>

                <strong>
                    ${item[1]}
                </strong>

                <p
                    style="
                        color:#8c9991;
                    "
                >
                    ${item[2]}
                </p>

            `;


            box.appendChild(
                div
            );

        }
    );

}


/* =====================================================
   WEIGHT CHART
===================================================== */

function drawChart() {

    const data =
        getData();


    const canvas =
        document.getElementById(
            "weightChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    const width =
        canvas.parentElement
            .clientWidth;


    const height =
        canvas.parentElement
            .clientHeight;


    canvas.width =
        width;


    canvas.height =
        height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (
        data.length < 2
    ) {

        ctx.fillStyle =
            "#8c9991";


        ctx.font =
            "15px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(
            "Log at least 2 days to see your weight graph",
            width / 2,
            height / 2
        );


        return;

    }


    const padding =
        40;


    const weights =
        data.map(
            item =>
            item.weight
        );


    const max =
        Math.max(
            ...weights
        ) + 1;


    const min =
        Math.min(
            ...weights
        ) - 1;


    const range =
        max - min;


    ctx.beginPath();


    data.forEach(
        (
            item,
            index
        ) => {

            const x =
                padding +
                (
                    index /
                    (
                        data.length -
                        1
                    )
                ) *
                (
                    width -
                    padding * 2
                );


            const y =
                height -
                padding -
                (
                    (
                        item.weight -
                        min
                    ) /
                    range
                ) *
                (
                    height -
                    padding * 2
                );


            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#00e676";


    ctx.lineWidth =
        4;


    ctx.stroke();


    data.forEach(
        (
            item,
            index
        ) => {

            const x =
                padding +
                (
                    index /
                    (
                        data.length -
                        1
                    )
                ) *
                (
                    width -
                    padding * 2
                );


            const y =
                height -
                padding -
                (
                    (
                        item.weight -
                        min
                    ) /
                    range
                ) *
                (
                    height -
                    padding * 2
                );


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                5,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#00e676";


            ctx.fill();

        }
    );

}


/* =====================================================
   RESET
===================================================== */

function resetTracker() {

    const answer =
        confirm(
            "Delete ALL Mission 75 data?"
        );


    if (!answer) {
        return;
    }


    localStorage.removeItem(
        "mission75Data"
    );


    location.reload();

}


/* =====================================================
   INITIAL LOAD
===================================================== */

window.onload =
function() {

    const date =
        new Date();


    document.getElementById(
        "todayText"
    ).innerText =
        date.toLocaleDateString(
            undefined,
            {
                weekday:
                    "short",

                month:
                    "short",

                day:
                    "numeric"
            }
        );


    updateDashboard();


    setTimeout(
        drawChart,
        100
    );

};


/* =====================================================
   RESIZE
===================================================== */

window.onresize =
function() {

    drawChart();

};