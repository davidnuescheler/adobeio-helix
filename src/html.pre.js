/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
const select = require('unist-util-select');
const visit = require('unist-util-visit');
const toHAST = require('mdast-util-to-hast');
const toHTML = require('hast-util-to-html');

/**
 * The 'pre' function that is executed before the HTML is rendered
 * @param payload The current payload of processing pipeline
 * @param payload.resource The content resource
 */
function pre(payload, config) {
  // banner is first image and banner text is image alt
  payload.resource.banner = {
    img: '',
    text: ''
  };
  const firstImg = select(payload.resource.mdast, 'image');
  if (firstImg.length > 0) {
    payload.resource.banner = {
      img: firstImg[0].url,
      text: firstImg[0].alt
    }
  } 

  const content = [];
  let foundFirstImg = false;
  // content is everything after first image
  visit(payload.resource.mdast, 'paragraph', function (node) {
    if (foundFirstImg) {
      // start adding nodes to result only after first image found
      const hast = toHAST(node);
      const html = toHTML(hast);
      content.push(html);
    }
    if (!foundFirstImg && node.children.length > 0 && node.children[0].type === 'image') {
      // look for first image
      foundFirstImg = true;
    }
  });

  payload.resource.content = content;
  
  // avoid htl execution error if missing
  payload.resource.meta = payload.resource.meta || {};
  payload.resource.meta.references = payload.resource.meta.references || [];
  payload.resource.meta.icon = payload.resource.meta.icon || '';
}

module.exports.pre = pre;
