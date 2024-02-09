# Slides Advisor

Proof-of-concept Google Workspace Add-on using Gemini to analyze and provide feedback on presentations.

## How it works

The add-on uses the Slides API to extract
thumbnails and speaker notes for a presentations. That information is then sent to the `gemini-vision-pro` model along
with a prompt asking it to review the material based on common best practices. The feedback is presented to the user in the add-on.

The demo uses a zero-shot prompting approach -- no example slides or feedback are provided. Nor has any fine tuning of the base Gemini model been performed.

## Customizing & improving results

Exploration and experimentation is encouraged. There are several ways to customize the add-on and improve the quality of the feedback.

* Change the guidelines in the prompt. The current guidelines are generic and cover a subset of recommendations for slides. Change the prompt to fit your own guidelines.
* Switch to few-shot prompting. Providing examples of slides that adhere to your guidelines or violate them may help Gemini
provide more relevant feedback.
* Use a fine-tuned model. If you have a large content library with feedback, consider fine-tuning your own model for the task.

## Setup

These instructions assume some familiarity with Apps Script, Add-ons, and Google Cloud Platform.


1. Create and install an add-on following the [quickstart](https://developers.google.com/apps-script/add-ons/translate-addon-sample)
1. Update the add-on source code & script manifest with the code from the `src` folder.
1. Enable Vertex AI in the Google Cloud project for the script.
1. Create a service account in the same project and grant it the `Vertex AI User` role.
1. Create and export a JSON key for the service account.
1. Set the `SERVICE_ACCOUNT_KEY` script property with the JSON key contents.

Open Google Slides to try the add-on. It should appear in the right hand side panel as an eye icon.