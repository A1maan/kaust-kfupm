(() => {
  const contentMap = window.KfupmDayContent || {};
  const dayKey = document.body?.dataset.dayKey;
  if (!dayKey) return;

  const content = contentMap[dayKey] || { resources: [], quizzes: [] };
  const resourceList = document.getElementById('resourceList');
  const resourceCard = document.getElementById('resourceCard');
  const quizList = document.getElementById('quizListContainer');
  const quizCount = document.getElementById('quizCount');
  const quizCard = document.getElementById('quizCard');

  const renderResources = () => {
    if (!resourceList) {
      return;
    }

    if (!content.resources || content.resources.length === 0) {
      if (resourceCard) {
        resourceCard.classList.add('d-none');
      }
      return;
    }

    resourceList.innerHTML = content.resources
      .map(
        (resource) => `
        <a class="resource-pill" href="${resource.href}">
          <div>
            <span class="pill-label">${resource.badge || 'Resource'}</span>
            <span class="pill-title d-block">${resource.title}</span>
            ${
              resource.description
                ? `<span class="text-muted small d-block">${resource.description}</span>`
                : ''
            }
          </div>
          <i class="bi bi-arrow-up-right"></i>
        </a>
      `
      )
      .join('');
  };

  const renderQuizzes = () => {
    if (!quizList) {
      return;
    }

    const quizzes = content.quizzes || [];

    if (!quizzes.length) {
      quizList.innerHTML = '<p class="text-muted mb-0">No quizzes are available for this day yet.</p>';
      if (quizCount) {
        quizCount.textContent = '0 decks';
      }
      return;
    }

    quizList.innerHTML = quizzes
      .map((quiz) => {
        const targetHref =
          typeof quiz.link === 'string' && quiz.link.trim().length > 0
            ? quiz.link
            : `../quiz.html?day=${encodeURIComponent(dayKey)}&quizId=${encodeURIComponent(quiz.id)}`;
        const buttonLabel = quiz.ctaLabel || (quiz.link ? 'Open quiz page' : 'Practice this quiz');
        const questionCount = Array.isArray(quiz.questions)
          ? quiz.questions.length
          : typeof quiz.questionCount === 'number'
          ? quiz.questionCount
          : 0;

        return `
        <div class="quiz-list-card">
          <div class="d-flex align-items-start justify-content-between gap-2 flex-wrap">
            <div>
              <p class="quiz-level mb-1">${quiz.level || 'Practice'}</p>
              <h5 class="mb-1">${quiz.title}</h5>
              <p class="quiz-description mb-1">${quiz.description || ''}</p>
              <p class="text-muted small mb-0">${quiz.focus || ''}</p>
            </div>
            <span class="quiz-duration">${quiz.duration || ''}</span>
          </div>
          <div class="quiz-meta mb-3">
            <span>${questionCount} questions</span>
          </div>
          <a class="btn btn-outline-primary w-100" href="${targetHref}">${buttonLabel}</a>
        </div>
      `;
      })
      .join('');

    if (quizCount) {
      const label = quizzes.length === 1 ? 'deck' : 'decks';
      quizCount.textContent = `${quizzes.length} ${label}`;
    }
  };

  renderResources();
  renderQuizzes();
})();
