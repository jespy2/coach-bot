async function applyRoadmap({ reset = false } = {}) {
  const teamIdID     = TEAM;
  const teamIdString = TEAM;
  const { backlog, todo } = await lookupStates(teamIdString);
  const weeks = getWeekStartDates(PROGRAM_START, 16);

  const buckets = new Map();
  const stretch = [];

  for await (const it of listIssues(teamIdID)) {
    const labels = it.labels?.nodes || [];
    const text = `${it.title} ${it.description}`.toLowerCase();

    const isStretch = /jenkins|github actions|gha/.test(text);
    if (isStretch) {
      stretch.push(it);
      continue;
    }

    const wk = weekFromExistingLabel(labels) ?? weekFromTitle(it.title) ?? 1;
    if (!buckets.has(wk)) buckets.set(wk, []);
    buckets.get(wk).push(it);
  }

  for (const [week, arr] of [...buckets.entries()].sort((a, b) => a - b)) {
    const label = `week-${week}`;
    const weekStart = weeks[week - 1];
    const maxItems = week === 15 ? 20 : 10;

    arr.sort((a, b) =>
      rankWithinWeek(a.title) - rankWithinWeek(b.title) ||
      a.identifier.localeCompare(b.identifier)
    );

    const inScope = arr.slice(0, maxItems);
    const overflow = arr.slice(maxItems);
    stretch.push(...overflow);

    for (let i = 0; i < inScope.length; i++) {
      const it = inScope[i];
      const labels = it.labels?.nodes || [];
      const have = new Set(labels.map(l => l.name));
      const want = new Set([label, phaseFromWeek(week), ...inferTopicLabels(it.title)]);

      if (![...have].some(n => /^effort:(S|M|L)$/i.test(n))) want.add("effort:M");

      const toAddNames = [...want].filter(n => !have.has(n));
      const toRemoveIds = reset
        ? labels.filter(l => /^week-\\d+$/.test(l.name)).map(l => l.id)
        : [];

      const addIds = [];
      for (const name of toAddNames) {
        const id = await getOrCreateLabelId(teamIdID, teamIdString, name);
        addIds.push(id);
        await sleep(25);
      }

      const dueISO = weekStart;
      const needTemplate = !it.description || !/## Goal/i.test(it.description);
      const finalDesc = needTemplate ? detailTemplateFor(it.title, [...want]) : it.description;

      await updateIssue(it.id, {
        labelIds: addIds,
        removeLabelIds: toRemoveIds,
        stateId: todo,
        description: finalDesc,
        dueDate: dueISO
      });
    }
  }

  for (const it of stretch) {
    const labels = it.labels?.nodes || [];
    const have = new Set(labels.map(l => l.name));
    const toRemoveIds = reset
      ? labels.filter(l => /^week-\\d+$/.test(l.name)).map(l => l.id)
      : [];
    const addIds = [];

    if (!have.has("stretch")) {
      const id = await getOrCreateLabelId(teamIdID, teamIdString, "stretch");
      addIds.push(id);
      await sleep(25);
    }

    await updateIssue(it.id, {
      labelIds: addIds,
      removeLabelIds: toRemoveIds,
      stateId: todo,
      dueDate: null
    });
  }
}
