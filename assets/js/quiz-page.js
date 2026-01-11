(() => {
  const samples = window.KfupmQuizSamples || {};
  const params = new URLSearchParams(window.location.search);
  const dayKey = params.get('day');
  const quizId = params.get('quizId');

  const elements = {
    title: document.getElementById('quizTitle'),
    summary: document.getElementById('quizSummary'),
    focus: document.getElementById('quizFocus'),
    level: document.getElementById('quizLevel'),
    duration: document.getElementById('quizDuration'),
    dayBadge: document.getElementById('dayBadge'),
    practicePanel: document.getElementById('practicePanel'),
    status: document.getElementById('quizStatus'),
    backLink: document.getElementById('backToDay')
  };

  const state = {
    quiz: null,
    currentQuestion: 0,
    selectedOption: null,
    answers: [],
    score: 0,
    showResults: false,
    notice: ''
  };

  const dayLabels = {
    day1: 'Day 1: Machine Learning Foundations',
    day2: 'Day 2: Machine Learning Algorithms',
    day3: 'Day 3: Fundamentals of Deep Learning',
    day4: 'Day 4: Deep Learning Continuation',
    day5: 'Day 5: Unsupervised Learning',
    day6: 'Day 6: Exam Readiness',
    extra: 'Extra Practice Decks'
  };

  const dayPaths = {
    day1: 'day1/index.html',
    day2: 'day2/index.html',
    day3: 'day3/index.html',
    day4: 'day4/index.html',
    day5: 'day5/index.html',
    day6: 'day6/index.html',
    extra: 'extra/index.html'
  };

  if (!dayKey || !quizId) {
    renderError('Missing quiz details. Please open this page from the day deck.');
    return;
  }

  if (elements.backLink && dayPaths[dayKey]) {
    elements.backLink.href = dayPaths[dayKey];
  }

  const deck = samples[dayKey] ? JSON.parse(JSON.stringify(samples[dayKey])) : [];
  const quiz = deck.find((entry) => entry.id === quizId);

  if (!quiz) {
    renderError('Quiz not found. Please return to the day page and try again.');
    return;
  }

  state.quiz = quiz;
  initializeQuizInfo();

  function initializeQuizInfo() {
    if (elements.title) elements.title.textContent = quiz.title;
    if (elements.summary) elements.summary.textContent = quiz.description;
    if (elements.focus) elements.focus.textContent = quiz.focus;
    if (elements.level) elements.level.textContent = quiz.level;
    if (elements.duration) elements.duration.textContent = quiz.duration;
    if (elements.dayBadge) elements.dayBadge.textContent = dayLabels[dayKey] || `Day: ${dayKey}`;
  }

  function renderError(message) {
    if (elements.practicePanel) {
      elements.practicePanel.innerHTML = `
        <div class="practice-placeholder text-center">
          <h5 class="mb-2">Unable to load quiz</h5>
          <p class="text-muted mb-0">${message}</p>
        </div>
      `;
    }
    if (elements.status) {
      elements.status.textContent = message;
      elements.status.classList.remove('d-none');
    }
  }

  function renderPractice() {
    if (!elements.practicePanel || !state.quiz) return;

    if (state.showResults) {
      elements.practicePanel.innerHTML = `
        <div class="practice-results">
          <div class="d-flex justify-content-between flex-wrap align-items-center gap-2 mb-3">
            <div>
              <p class="eyebrow mb-1 text-muted text-uppercase">Quiz complete</p>
              <h4 class="mb-0">${state.quiz.title}</h4>
            </div>
            <span class="badge-soft">Score ${state.score}/${state.quiz.questions.length}</span>
          </div>
          <ul>
            ${state.quiz.questions
              .map((question, index) => {
                const userAnswer = state.answers[index];
                const correct = userAnswer === question.answer;
                return `
                  <li class="${correct ? 'correct' : 'incorrect'}">
                    <p class="fw-semibold mb-1">${question.prompt}</p>
                    <p class="mb-1"><strong>Your answer:</strong> ${
                      question.options[userAnswer] ?? 'Not answered'
                    }</p>
                    <p class="mb-1"><strong>Correct:</strong> ${question.options[question.answer]}</p>
                    ${question.note ? `<p class="text-muted mb-0">${question.note}</p>` : ''}
                  </li>
                `;
              })
              .join('')}
          </ul>
          <div class="practice-actions">
            <button class="btn btn-primary" data-action="retry">Retry quiz</button>
            <a class="btn btn-outline-secondary" href="${dayPaths[dayKey] || 'index.html'}">Back to day deck</a>
          </div>
        </div>
      `;

      const retryBtn = elements.practicePanel.querySelector('[data-action="retry"]');
      retryBtn?.addEventListener('click', () => startQuiz());
      return;
    }

    const question = state.quiz.questions[state.currentQuestion];
    const progressPercent = Math.round((state.currentQuestion / state.quiz.questions.length) * 100);

    elements.practicePanel.innerHTML = `
      <div>
        <div class="d-flex justify-content-between flex-wrap align-items-start gap-2 mb-3">
          <div>
            <p class="eyebrow mb-1 text-muted text-uppercase">Now practicing</p>
            <h4 class="mb-1">${state.quiz.title}</h4>
            <p class="text-muted mb-0">${state.quiz.focus}</p>
          </div>
          <button class="btn btn-link p-0" data-action="exit">Save for later</button>
        </div>
        <div class="practice-progress mb-3">
          <span style="width:${progressPercent}%"></span>
        </div>
        <p class="text-muted mb-1">Question ${state.currentQuestion + 1} of ${state.quiz.questions.length}</p>
        <h5 class="mb-3">${question.prompt}</h5>
        <div class="practice-options mb-3">
          ${question.options
            .map(
              (option, index) => `
            <button class="practice-option ${state.selectedOption === index ? 'active' : ''}" data-option="${index}">
              <span>${String.fromCharCode(65 + index)}.</span>
              <span>${option}</span>
            </button>
          `
            )
            .join('')}
        </div>
        ${state.notice ? `<p class="practice-notice">${state.notice}</p>` : ''}
        <button class="btn btn-primary" data-action="submit">Submit answer</button>
      </div>
    `;

    elements.practicePanel.querySelectorAll('.practice-option').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedOption = Number(button.dataset.option);
        state.notice = '';
        renderPractice();
      });
    });

    const submitBtn = elements.practicePanel.querySelector('[data-action="submit"]');
    const exitBtn = elements.practicePanel.querySelector('[data-action="exit"]');
    submitBtn?.addEventListener('click', handleSubmit);
    exitBtn?.addEventListener('click', () => {
      window.location.href = dayPaths[dayKey] || 'index.html';
    });
  }

  function handleSubmit() {
    if (state.selectedOption === null) {
      state.notice = 'Select an option before submitting.';
      renderPractice();
      return;
    }

    const question = state.quiz.questions[state.currentQuestion];
    const isCorrect = state.selectedOption === question.answer;
    if (isCorrect) state.score += 1;
    state.answers.push(state.selectedOption);
    state.selectedOption = null;
    state.notice = '';

    if (state.currentQuestion + 1 === state.quiz.questions.length) {
      state.showResults = true;
    } else {
      state.currentQuestion += 1;
    }
    renderPractice();
  }

  function startQuiz() {
    state.currentQuestion = 0;
    state.selectedOption = null;
    state.answers = [];
    state.score = 0;
    state.showResults = false;
    state.notice = '';
    renderPractice();
  }

  startQuiz();
})();
