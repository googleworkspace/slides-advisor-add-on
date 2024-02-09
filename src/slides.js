/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Gets the ID of the currently viewed page.
 */
function getSelectedPageId() {
  const presentation = SlidesApp.getActivePresentation();
  const selection = presentation.getSelection();
  if (!selection) {
    return null;
  }
  const currentPage = selection.getCurrentPage();

  if (!currentPage) {
    return null;
  }
  const pageId = currentPage.asSlide().getObjectId();
  return pageId
}

/**
 * Gets the ID of the currently viewed presentation.
 */
function getPresentationId() {
  const presentation = SlidesApp.getActivePresentation();
  if (!presentation) {
    return null;
  }
  return presentation.getId();
}

/**
 * Fetches the thumbnail for the given slide.
 */
function fetchThumbnail(presentationId, pageId) {
  const metadata = Slides.Presentations.Pages.getThumbnail(presentationId, pageId, {
    "thumbnailProperties.mimeType": "PNG",
    "thumbnailProperties.thumbnailSize": "LARGE"
  });
  if (!metadata) {
    return null;
  }
  const url = metadata.contentUrl;
  if (!url) {
    return null;
  }
  const mediaResponse = UrlFetchApp.fetch(url);
  const thumbnail = mediaResponse.getBlob();
  return Utilities.base64Encode(thumbnail.getBytes());
}

/**
 * Fetches the speaker notes for the given slide.
 */
function fetchSpeakerNotes(presentationId, pageId) {
  const page = Slides.Presentations.Pages.get(presentationId, pageId);
  if (!page || !page.notesProperties || !page.pageElements) {
    return null;
  }

  const objectId = page.notesProperties.speakerNotesObjectId;
  if (!objectId) {
    return null;
  }

  const notesObject = page.pageElements.find(p => p.objectId === objectId);
  if (!notesObject || !notesObject.shape) {
    return null;
  }

  return flattenText(notesObject.shape.text);
}

/**
 * Simplistic method for flatting text elements into a string. Only considers
 * text content itself and ignores formatting/text runs.
 */
function flattenText(text) {
  if (!text) {
    return null;
  }
  text = text.textElements.reduce((text, span) => {
    if (!span.textRun || !span.textRun.content) {
      return text;
    }
    return text + span.textRun.content;
  }, '');
  return text;
}