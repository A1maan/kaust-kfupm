(() => {
  const samples = window.KfupmQuizSamples || {};
  const dayKey = document.body?.dataset.dayKey;
  if (!dayKey) return;

  const elements = {
    list: document.getElementById('quizListContainer'),
    count: document.getElementById('quizCount')
  };

  const dayLabels = {
    day1: 'Day 1',
    day2: 'Day 2',
    day3: 'Day 3',
    day4: 'Day 4',
    day5: 'Day 5',
    extra: 'Extra'
  };

  const deck = samples[dayKey] || [];
  const friendlyDay = dayLabels[dayKey] || `Day ${dayKey}`;

  const renderList = () => {
    if (!elements.list) {
      return;
    }

    if (!deck.length) {
      elements.list.innerHTML = '<p class="text-muted mb-0">No quizzes available for this day yet.</p>';
      if (elements.count) {
        elements.count.textContent = '0 decks';
      }
      return;
    }

    elements.list.innerHTML = deck
      .map((quiz) => {
        const targetHref =
          typeof quiz.link === 'string' && quiz.link.trim().length > 0
            ? quiz.link
            : `../quiz.html?day=${encodeURIComponent(dayKey)}&quizId=${encodeURIComponent(quiz.id)}`;
        const buttonLabel = quiz.link ? 'Open quiz page' : 'Practice this quiz';
        const questionCount = Array.isArray(quiz.questions)
          ? quiz.questions.length
          : typeof quiz.questionCount === 'number'
            ? quiz.questionCount
            : 0;

        return `
        <div class="quiz-list-card">
          <div class="d-flex align-items-start justify-content-between gap-2 flex-wrap">
            <div>
              <p class="quiz-level mb-1">${quiz.level}</p>
              <h5 class="mb-1">${quiz.title}</h5>
              <p class="quiz-description mb-1">${quiz.description}</p>
              <p class="text-muted small mb-0">${quiz.focus}</p>
            </div>
            <span class="quiz-duration">${quiz.duration}</span>
          </div>
          <div class="quiz-meta mb-3">
            <span>${questionCount} questions</span>
          </div>
          <a class="btn btn-outline-primary w-100" href="${targetHref}">${buttonLabel}</a>
        </div>
      `;
      })
      .join('');

    if (elements.count) {
      const label = deck.length === 1 ? 'deck' : 'decks';
      elements.count.textContent = `${deck.length} ${label}`;
    }
  };

  renderList();
})();
