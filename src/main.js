/**
 * Create project
 * Enable vertex ai
 * Create service account & key
 * Grant it the Vertex AI User role
 * Save key as SERVICE_ACCOUNT_KEY script property
 * 
 */

/**
 * Main entry point for add-on when opened.
 * 
 * @param e - Add-on event context
 */
function onHomepageOpened(e) {
  const card = buildAnalyzeSlideCard();
  return {
    action: {
      navigations: [
        {
          pushCard: card
        }
      ]
    }
  };
}

/**
 * Handles button click in the add-on to analyze the current slide
 * 
 * @param e - Add-on event context
 */
function onAnalyzeSlideClicked(e) {
  const presentationId = getPresentationId();
  const pageId = getSelectedPageId();
  const thumbnail = fetchThumbnail(presentationId, pageId);
  const notes = fetchSpeakerNotes(presentationId, pageId);
  const analysis = analyzeSlides({
    thumbnail,
    notes,
  });

  return {
    renderActions: {
      action: {
        navigations: [
          {
            updateCard: buildAnalyzeSlideCard(analysis)
          }
        ]
      }
    }
  }
}