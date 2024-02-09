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
const MODEL_ID = "gemini-pro-vision";
const LOCATION = "us-west1";

const SYSTEM_PROMPT = `
Your task is to provide constructive feedback on a presentation.

Begin by stating the main message of the slide.

For each of the following categories evaluate the given slide. Score each category on a scale of 0 to 100 and concisely explain the reasoning. Do not suggest improvements if the score is 80 or above.

* Simplicity -- Slides should focus on one main idea per slides and any text or images should be consistent with the idea. Slides should have either a few brief bullet points or 1 to two sentances to make an impactful statement. Score the slide
lower if the main message is not clear.

* Color and typography -- Slides should have consistent fonts that are large enough to read. Colors can be used for emphasis and should always have a high contrast ratio. Slides with low contrast ratios
or font sizes that are too small should be scored lower. No more than 3 different fonts should be used on a slide.

* Structure and whitespace -- Slides should have a clear structure and adequate whitespace to not feel cluttered or crowded. 

* Graphics & icons -- Bold imagery or charts to emphasize the message are encouraged and should be scored higher. Icons should be used instead of bullet points. It is OK if a slide contains no graphics if the
text is simple and focuses on a single message.

Format the response as markdown with headers, bullets, and new lines.

The slide to review is below:
`;

function analyzeSlides(slide) {

  const generationConfig = {
    temperature: 0.1,
    maxOutputTokens: 1024 * 2,
  };

  const safetySettings = [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ];

  const slideParts = [
    {
      inlineData: {
        mimeType: 'image/png',
        data: slide.thumbnail,
      }
    }
  ];
  if (slide.notes) {
    slideParts.push({
      text: `Speaker notes: ${slide.notes ?? ''}\n`
    });
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: SYSTEM_PROMPT,
        },
        ...slideParts,

      ]
    }
  ];

  const body = {
    generationConfig,
    safetySettings,
    contents,
  }
  const credentials = credentialsForVertexAI();
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${credentials.projectId}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:streamGenerateContent`
  const response = UrlFetchApp.fetch(url, {
    method: "POST",
    contentType: "application/json",
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  })

  if (response.getResponseCode() >= 400) {
    console.log(response.getContentText());
    throw new Error(`Unable to analyze slides. Try again later. Error ${response.getResponseCode()}: ${response.getContentText()}`);
  }

  const parsedResponse = JSON.parse(response.getContentText());
  console.log(JSON.stringify(parsedResponse, null, 2));

  if (!parsedResponse.length === 0) {
    return 'Unable to analyze slides. Try again later.';
  }
  
  return parsedResponse.reduce((text, entry) => {
    return text + entry.candidates[0].content.parts[0].text;
  }, '');
}

function credentialsForVertexAI() {
  const credentials = PropertiesService.getScriptProperties().getProperty("SERVICE_ACCOUNT_KEY");
  if (!credentials) {
    throw new Error("SERVICE_ACCOUNT_KEY script property must be set.");
  }

  const parsedCredentials = JSON.parse(credentials);

  const service = OAuth2.createService("Vertex")
      .setTokenUrl('https://oauth2.googleapis.com/token')
      .setPrivateKey(parsedCredentials['private_key'])
      .setIssuer(parsedCredentials['client_email'])
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope("https://www.googleapis.com/auth/cloud-platform");
  return {
    projectId:  parsedCredentials['project_id'],
    accessToken: service.getAccessToken(),
  }
}