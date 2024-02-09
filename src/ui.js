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
 * Convert a subset of markdown into HTML tags for the text paragraph widget.
 */
function formatOutput(str) {
  return str.replace(/#+\s+(.*)/g, "<b>$1</b></br>")
    .replace(/Score:\s*(\d+)/g, "<i>Score: </i><b>$1</b></br>");
}

function buildAnalyzeSlideCard(results) {
  const widgets = [
    {
      buttonList: {
        buttons: [
          {
            text: "Evaluate slide",
            onClick: {
              action: {
                function: "onAnalyzeSlideClicked",
              },
            },
          },
        ],
      },
    },
  ];

  if (!results) {
    widgets.push(
      {
        textParagraph: {
          text: "To analyze the current slide, click the button below.",
        },
      },
    );
  } else {
    widgets.push(
      {
        textParagraph: {
          text: formatOutput(results),
        }
      },
    );
  }

  return {
    sections: [
      {
        widgets
      },
    ],
  };
}
