'use strict';

// Data
// DIFFERENT DATA! Contains movement dates, currency and locale
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2025-05-08T14:11:59.604Z',
    '2025-06-18T17:01:17.194Z',
    '2025-06-22T00:36:17.929Z',
    '2025-06-23T00:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2025-06-10T14:43:26.374Z',
    '2025-06-21T18:49:59.371Z',
    '2025-06-23T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
//   type: 'Premium',
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
//   type: 'Standard',
// };

// const account5 = {
//   owner: 'Taraha New',
//   movements: [],
//   interestRate: 0.7,
//   pin: 5555,
//   type: 'Basic',
// };

const accounts = [account1, account2 /* account3, account4, account5*/];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//---------------------
//formating date
//---------------------
const formatDates = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'YesterDay';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
};

//---------------------
//showing movements in the account
//---------------------
const displayMovements = function (acc, sortItem = false) {
  containerMovements.innerHTML = ''; //.textContent = ''
  const combinedMovementAndDate = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  if (sortItem) {
    combinedMovementAndDate.sort((a, b) => a.movement - b.movement);
  }

  // const sortMovements = sortItem
  //   ? combinedMovementAndDate.slice().sort((a, b) => a.movement - b.movement)
  //   : combinedMovementAndDate;

  combinedMovementAndDate.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    //showing movement date
    const displayDate = new Date(movementDate);
    const displayDateStr = formatDates(displayDate);

    //showing movements
    const newHTML = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDateStr}</div>
          <div class="movements__value">${movement.toFixed(2)}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', newHTML);
  }); //here movements is the array
};

// console.log(containerMovements.innerHTML);
// console.log(containerMovements.textContent);

//---------------------
//Calculating Balance
//---------------------

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

//---------------------
//Calculating Summary
//---------------------

const calcDisplaySummary = function (acc) {
  const deposits = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${deposits.toFixed(2)}€`;

  const withdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${Math.abs(withdrawals.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      //bank introduces a condition that only the interest that is above 1 will be added
      return int > 1;
    })
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

//---------------------
//Update Ui
//---------------------
const updateUI = function (acc) {
  //Display Movements
  displayMovements(acc);

  //Display Balance
  calcDisplayBalance(acc);

  //Display Summary
  calcDisplaySummary(acc);
};

//---------------------
//creating username
//---------------------

const createUserName = function (accs) {
  accs.forEach(function (acc) {
    //creating a new key in every account object
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ') //converting the name into array
      .map(word => word[0]) //taking the first two letter
      .join('');
  });
};
createUserName(accounts);
// console.log(accounts);

//---------------------
//Implementing Login
//Event handler
//---------------------

let currentAccount;

//fake alwz logged in
//currentAccount = account1;
//containerApp.style.opacity = 1;
//updateUI(currentAccount);

btnLogin.addEventListener('click', function (event) {
  // Prevent form from submitting
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  // console.log(currentAccount);
  // if (currentAccount?.pin === Number(inputLoginPin.value)) or
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display Ui and Welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //dates updating
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    const hour = `${now.getHours()}`.padStart(2, '0');
    const min = `${now.getMinutes()}`.padStart(2, '0');
    const dateStr = `${day}/${month}/${year}, ${hour}:${min}`;
    labelDate.textContent = dateStr;

    //Display Movements
    // displayMovements(currentAccount.movements);

    //Display Balance
    // calcDisplayBalance(currentAccount);

    //Display Summary
    // calcDisplaySummary(currentAccount);

    //Update Ui
    updateUI(currentAccount);
  }
});

//---------------------
//Implementing Transfer
//---------------------

btnTransfer.addEventListener('click', function (event) {
  // Prevent form from submitting
  event.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  // console.log(amount, receiverAcc);
  if (
    amount > 0 &&
    receiverAcc && // যাকে টাকা পাঠাচ্ছো, তার অ্যাকাউন্ট আছে কিনা সেটা চেক করে। যদি undefined হয় (মানে userName ভুল টাইপ করেছো), তাহলে transfer হবে না।
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName //তুমি নিজের কাছেই টাকা পাঠাচ্ছো কিনা সেটা চেক করে। Same account-এ টাকা পাঠানো যাবে না। (?. use করা হইছে যেন receiverAcc না থাকলে error না দেয়)
  ) {
    //Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //updating the dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //Update Ui
    updateUI(currentAccount);
  }
});

//---------------------
//Requesting Loan
//Bank Condition = Loan will be granted if Atleast One deposit is atleast 10% of the requested loan amount
//---------------------

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    //Add Loan amount to the movements
    currentAccount.movements.push(loanAmount);
    //updating the dates
    currentAccount.movementsDates.push(new Date().toISOString());

    //update ui
    updateUI(currentAccount);
  }
});

//---------------------
//Closing Account
//---------------------

btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    //Close Account
    accounts.splice(index, 1);
    //Hide UI
    containerApp.style.opacity = 0;
    alert('Are you sure you want to close your account?');
  }
  alert('Your account has been deactivated. Thank you for banking with us');
  labelWelcome.textContent = 'Log in to get started';
  inputCloseUsername.value = inputClosePin.value = '';
});

//---------------------
//sorting functionality
//---------------------
let sortedState = false;

//sort button
btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  // প্রথমেই sorted এর উল্টো মান পাঠাও, তাহলে toggle হবে ঠিকভাবে
  displayMovements(currentAccount, !sortedState);
  // তারপর sorted এর মান flip করে দাও
  sortedState = !sortedState;
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------

//lectures
// console.log(23 === 23.0);
// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3);

// //str to number
// console.log(Number('23'));
// console.log(+'23');

//parsing
// console.log(Number.parseInt('203px'));
// console.log(Number.parseInt('px23'));
// console.log(Number.parseInt('3px', 10)); //3
// console.log(Number.parseInt('1px', 2)); //1
// console.log(Number.parseInt('0px', 2)); //0
// console.log(Number.parseInt('3px', 2)); //Nan
// console.log(Number.parseInt('0px', 10));

// console.log(Number.parseInt('3.5rem')); //3--> cant read decimals
// console.log(Number.parseFloat('3.5rem'));

// console.log(Number.isNaN(20)); //f
// console.log(Number.isNaN('20')); //f
// console.log(Number.isNaN('20px')); //f
// console.log(Number.isNaN(+'20px')); //t
// console.log(Number.isNaN(+'20')); //f
// console.log(Number.isNaN(23 / 0)); //f

//better to use if A value is number or not
// console.log(Number.isFinite(20)); //t
// console.log(Number.isFinite('20')); //f
// console.log(Number.isFinite('20px')); //f
// console.log(Number.isFinite(+'20px')); //f
// console.log(Number.isFinite(+'20')); //t
// console.log(Number.isFinite(23 / 0)); //f

// console.log(Number.isInteger(20)); //t
// console.log(Number.isInteger(20.5)); //f
// console.log(Number.isInteger('20')); //f
// console.log(Number.isInteger('20px')); //f
// console.log(Number.isInteger(+'20px')); //f
// console.log(Number.isInteger(+'20')); //t
// console.log(Number.isInteger(23 / 0)); //f

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));
// console.log(Math.max(5, 7, 9, '23', '25px'));
// console.log(Math.min(5, 7, 9));

//circle area
// console.log(Math.PI * Number.parseFloat('10px') ** 2);
// console.log(Math.trunc(Math.random() * 6) + 1);

//random number generator
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1)) + min;

// console.log(randomInt(10, 20));
// console.log(randomInt(0, 3));

//rounding Integers
// console.log(Math.floor(-5.99));
// console.log(Math.trunc(-5.99));
// console.log(Math.round(-5.99)); //nearest integers
// console.log(Math.ceil(-5.99));

// console.log(Math.floor(5.1));
// console.log(Math.trunc(5.1));
// console.log(Math.round(5.1));
// console.log(Math.ceil(5.1)); //6
// console.log(Math.ceil(5.9)); //6

// console.log(Math.ceil('7.9'));
// console.log(Math.round('7.9'));
// console.log(Math.floor('7.9'));
// console.log(Math.trunc('7.9'));

//rounding decimals/floating point
// console.log((2.7).toFixed(3));
// console.log((2.75).toFixed(1));
// console.log(+(2.7).toFixed(3));

//remainder Operator
// console.log(5 % 2);
// console.log(5 / 2);
// const evenOrOdd = num => (num % 2 === 0 ? `${num} is even` : `${num} is odd`);
// console.log(evenOrOdd(15));
// console.log(evenOrOdd(14));

// const completelyDivisible = (num1, num2) =>
//   num1 % num2 === 0
//     ? `${num1} is completely divisible by ${num2}`
//     : `${num1} is not divisible by ${num2}`;
// console.log(completelyDivisible(15, 3));
// console.log(completelyDivisible(15, 2));
// console.log(completelyDivisible(15.5, 2.5));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) {
//       //0,2,4,6
//       row.style.backgroundColor = 'orangered';
//     }
//     if (i % 3 === 0) {
//       //0,3,6,9
//       row.style.backgroundColor = 'blue';
//     }
//   });
// });

// console.log(document.querySelectorAll('.movements__row'));
// console.log([...document.querySelectorAll('.movements__row')]);

//Numeric Seperators
// const diameter = 287_460_000_000; //287,460,000,000
// console.log(diameter);
// const priceCents = 345_99; //not 345.99
// console.log(priceCents);
// const Pi = 3.14_15; //_ only btwn numbers
// console.log(Pi);
// console.log(Number('23_000')); //doesnt work
// console.log(parseInt('23_000')); //returns 23

//big int
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2 ** 53 + 1);
// console.log(2 ** 53 + 0);
// console.log(2 ** 53 + 2);
// console.log(2 ** 53 + 3);
// console.log(2 ** 53 + 4);
// console.log(2 ** 53 + 5);

// console.log(453355345325456565665862326);
// const bigIntNumber = 453355345325456565665862326n;
// console.log(bigIntNumber);
// console.log(BigInt(453355345325456565665862326));
// console.log(typeof bigIntNumber);

// //operations with bigint
// console.log(10000n + 10000n);
// console.log(1654654651665561654654615165n * 100000n);
// const huge = 13213262302321534263253132n;
// const num = 23;
// console.log(huge * num); //cannot mix normal number
// console.log(huge * BigInt(num)); //works
// console.log(15n > 15); //comparison works
// console.log(17n > 15);
// console.log(17n === 17); //doesnt work, === doesnt do type coercion
// console.log(17n == 17); //true
// console.log(typeof 17n);

// console.log(huge + ' is really big'); //bigint converted to string

// console.log(Math.sqrt(16n));//Math operations doesnt work
// console.log(16n / 4n);
// console.log(16n / BigInt(8));
// console.log(16n / 5n); //no decimal no remainder just result---3n
// console.log(16n / 3n); //5n

//creating dates
// const now = new Date();
// console.log(now);

// console.log(new Date('Jun 22 2025 17:15:41'));
// console.log(new Date('December 24,21025'));

// console.log(new Date(account1.movementsDates[0])); //bd time 6hr before
// console.log(account1.movementsDates[0]); //utc time
// console.log(new Date(2026, 1, 28, 11, 10, 59));
// console.log(new Date(0)); //unix time

// console.log(new Date(3 * 24 * 60 * 60 * 1000)); //day*hr*min*sec*milisec to get 3 days after unix time jan1 ,1970

//working with dates--date methods
// const future = new Date(2026, 1, 28, 11, 10);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay()); //day of the week
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// //from time stamp to date
// console.log(new Date(1772255400000));
// console.log(Date.now());

// //changing set date
// future.setFullYear(2040);
// future.setMonth(7);
// future.setDate(20);
// console.log(future);

//operations with dates
const future = new Date(2026, 1, 28, 11, 10);
const value = +future;
// console.log(value);
// const nowDate = +new Date();
// console.log(nowDate);
// console.log(value - nowDate);

// const tim = new Date(value - nowDate);
// console.log(tim);
// console.log(tim.getMonth());
// const oldDate = Date.now();
// console.log(oldDate);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));
// const days1 = calcDaysPassed(new Date(2026, 0, 28), new Date(2026, 0, 8));
// console.log(days1);
console.log(2);
