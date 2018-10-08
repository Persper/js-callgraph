/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const { trackFunctions } = require('../../src/trackFunctions');
const astutil = require('../../src/astutil');
const fs = require('fs');

test('Test trackFunctions', () => {
	const truth = {
				"WebPage.js:includeJs:86:96:356": "WebPage.js:includeJs:86:88:73",
        "WebPage.js:viewportSize:101:103:44": "WebPage.js:viewportSize:93:95:44",
        "WebPage.js:customHeaders:108:110:56": "WebPage.js:customHeaders:100:102:56",
        "WebPage.js:customHeaders:115:117:69": "WebPage.js:customHeaders:107:109:69",
        "WebPage.js:injectJs:122:129:262": "WebPage.js:injectJs:114:121:262",
        "WebPage.js:plainText:134:136:56": "WebPage.js:plainText:126:128:56",
        "WebPage.js:title:141:143:52": "WebPage.js:title:133:135:52",
        "WebPage.js:onError:148:150:40": "WebPage.js:onError:140:142:40",
        "WebPage.js:onError:155:159:126": "WebPage.js:onError:147:151:126",
        "WebPage.js:onConfirm:164:166:42": "WebPage.js:onConfirm:156:158:42",
        "WebPage.js:onConfirm:171:175:128": "WebPage.js:onConfirm:163:167:128",
        "WebPage.js:_onDialog:177:182:163": "WebPage.js:_onDialog:169:174:163",
        "WebPage.js:url:187:189:50": "WebPage.js:url:179:181:50",
        "WebPage.js:content:194:196:58": "WebPage.js:content:186:188:58",
        "WebPage.js:open:202:217:601": "WebPage.js:open:194:209:601",
        "WebPage.js:anon:204:216:431": "WebPage.js:anon:196:208:431",
        "WebPage.js:viewportSize:222:224:61": "WebPage.js:viewportSize:214:216:61",
        "WebPage.js:evaluate:230:232:79": "WebPage.js:evaluate:222:224:79",
        "WebPage.js:render:237:257:908": "WebPage.js:render:229:249:908",
        "WebPage.js:release:259:261:38": "WebPage.js:release:251:253:38",
        "WebPage.js:close:263:265:38": "WebPage.js:close:255:257:38",
        "WebPage.js:constructor:272:274:41": "WebPage.js:constructor:264:266:41",
        "WebPage.js:userAgent:279:281:70": "WebPage.js:userAgent:271:273:70",
        "WebPage.js:userAgent:286:288:57": "WebPage.js:userAgent:278:280:57",
        "WebPage.js:constructor:305:311:220": "WebPage.js:constructor:297:303:220",
        "WebPage.js:_onListenerAdded:313:320:300": "WebPage.js:_onListenerAdded:305:312:300",
        "WebPage.js:anon:315:317:88": "WebPage.js:anon:307:309:88",
        "WebPage.js:anon:316:316:32": "WebPage.js:anon:308:308:32",
        "WebPage.js:_onListenerRemoved:322:324:91": "WebPage.js:_onListenerRemoved:314:316:91",
    }
	const oldFname = 'tests/jest/WebPage.old';
	const newFname = 'tests/jest/WebPage.new';
	const oldSrc = fs.readFileSync(oldFname, 'utf-8');
	const newSrc = fs.readFileSync(newFname, 'utf-8');
	const oldAST = astutil.buildSingleAST('WebPage.js', oldSrc);
	const newAST = astutil.buildSingleAST('WebPage.js', newSrc);
	const oldFuncLst = astutil.getFunctions(oldAST);
	const newFuncLst = astutil.getFunctions(newAST);
	expect(trackFunctions(oldFuncLst, newFuncLst)).toEqual(truth);
});
