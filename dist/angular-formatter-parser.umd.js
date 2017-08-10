(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/forms')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/common', '@angular/core', '@angular/forms'], factory) :
	(factory((global['angular-formatter-parser'] = {}),global._angular_common,global._angular_core,global._angular_forms));
}(this, (function (exports,_angular_common,_angular_core,_angular_forms) { 'use strict';

var placeholderChar = '_';

var emptyArray = [];
/**
 * @param {?=} mask
 * @param {?=} placeholderChar
 * @return {?}
 */
function convertMaskToPlaceholder(mask, placeholderChar$$1) {
    if (mask === void 0) { mask = emptyArray; }
    if (placeholderChar$$1 === void 0) { placeholderChar$$1 = placeholderChar; }
    if (mask.indexOf(placeholderChar$$1) !== -1) {
        throw new Error('Placeholder character must not be used as part of the mask. Please specify a character ' +
            'that is not present in your mask as your placeholder character.\n\n' +
            ("The placeholder character that was received is: " + JSON.stringify(placeholderChar$$1) + "\n\n") +
            ("The mask that was received is: " + JSON.stringify(mask)));
    }
    return mask.map(function (char) {
        return (char instanceof RegExp) ? placeholderChar$$1 : char;
    }).join('');
}
/**
 * @param {?} value
 * @return {?}
 */

/**
 * @param {?} value
 * @return {?}
 */

/**
 * @param {?} mask
 * @return {?}
 */

var emptyString = '';
/**
 * @param {?=} rawValue
 * @param {?=} mask
 * @param {?=} config
 * @return {?}
 */
function conformToMask(rawValue, mask, config) {
    if (rawValue === void 0) { rawValue = emptyString; }
    if (mask === void 0) { mask = emptyString; }
    if (config === void 0) { config = {}; }
    // These configurations tell us how to conform the mask
    var _a = config.guide, guide = _a === void 0 ? true : _a, _b = config.previousConformedValue, previousConformedValue = _b === void 0 ? emptyString : _b, _c = config.placeholderChar, placeholderChar$$1 = _c === void 0 ? placeholderChar : _c, _d = config.placeholder, placeholder = _d === void 0 ? convertMaskToPlaceholder(mask, placeholderChar$$1) : _d, currentCaretPosition = config.currentCaretPosition, keepCharPositions = config.keepCharPositions;
    // The configs below indicate that the user wants the algorithm to work in *no guide* mode
    var /** @type {?} */ suppressGuide = guide === false && previousConformedValue !== undefined;
    // Calculate lengths once for performance
    var /** @type {?} */ rawValueLength = rawValue.length;
    var /** @type {?} */ previousConformedValueLength = previousConformedValue.length;
    var /** @type {?} */ placeholderLength = placeholder.length;
    var /** @type {?} */ maskLength = mask.length;
    // This tells us the number of edited characters and the direction in which they were edited (+/-)
    var /** @type {?} */ editDistance = rawValueLength - previousConformedValueLength;
    // In *no guide* mode, we need to know if the user is trying to add a character or not
    var /** @type {?} */ isAddition = editDistance > 0;
    // Tells us the index of the first change. For (438) 394-4938 to (38) 394-4938, that would be 1
    var /** @type {?} */ indexOfFirstChange = currentCaretPosition + (isAddition ? -editDistance : 0);
    // We're also gonna need the index of last change, which we can derive as follows...
    var /** @type {?} */ indexOfLastChange = indexOfFirstChange + Math.abs(editDistance);
    // If `conformToMask` is configured to keep character positions, that is, for mask 111, previous value
    // _2_ and raw value 3_2_, the new conformed value should be 32_, not 3_2 (default behavior). That's in the case of
    // addition. And in the case of deletion, previous value _23, raw value _3, the new conformed string should be
    // __3, not _3_ (default behavior)
    //
    // The next block of logic handles keeping character positions for the case of deletion. (Keeping
    // character positions for the case of addition is further down since it is handled differently.)
    // To do this, we want to compensate for all characters that were deleted
    if (keepCharPositions === true && !isAddition) {
        // We will be storing the new placeholder characters in this variable.
        var /** @type {?} */ compensatingPlaceholderChars = emptyString;
        // For every character that was deleted from a placeholder position, we add a placeholder char
        for (var /** @type {?} */ i = indexOfFirstChange; i < indexOfLastChange; i++) {
            if (placeholder[i] === placeholderChar$$1) {
                compensatingPlaceholderChars += placeholderChar$$1;
            }
        }
        // Now we trick our algorithm by modifying the raw value to make it contain additional placeholder characters
        // That way when the we start laying the characters again on the mask, it will keep the non-deleted characters
        // in their positions.
        rawValue = (rawValue.slice(0, indexOfFirstChange) +
            compensatingPlaceholderChars +
            rawValue.slice(indexOfFirstChange, rawValueLength));
    }
    // Convert `rawValue` string to an array, and mark characters based on whether they are newly added or have
    // existed in the previous conformed value. Identifying new and old characters is needed for `conformToMask`
    // to work if it is configured to keep character positions.
    var /** @type {?} */ rawValueArr = rawValue
        .split(emptyString)
        .map(function (char, i) { return ({
        char: char,
        isNew: i >= indexOfFirstChange && i < indexOfLastChange
    }); });
    // The loop below removes masking characters from user input. For example, for mask
    // `00 (111)`, the placeholder would be `00 (___)`. If user input is `00 (234)`, the loop below
    // would remove all characters but `234` from the `rawValueArr`. The rest of the algorithm
    // then would lay `234` on top of the available placeholder positions in the mask.
    for (var /** @type {?} */ i = rawValueLength - 1; i >= 0; i--) {
        var char = rawValueArr[i].char;
        if (char !== placeholderChar$$1) {
            var /** @type {?} */ shouldOffset = i >= indexOfFirstChange && previousConformedValueLength === maskLength;
            if (char === placeholder[(shouldOffset) ? i - editDistance : i]) {
                rawValueArr.splice(i, 1);
            }
        }
    }
    // This is the variable that we will be filling with characters as we figure them out
    // in the algorithm below
    var /** @type {?} */ conformedValue = emptyString;
    var /** @type {?} */ someCharsRejected = false;
    // Ok, so first we loop through the placeholder looking for placeholder characters to fill up.
    placeholderLoop: for (var /** @type {?} */ i = 0; i < placeholderLength; i++) {
        var /** @type {?} */ charInPlaceholder = placeholder[i];
        // We see one. Let's find out what we can put in it.
        if (charInPlaceholder === placeholderChar$$1) {
            // But before that, do we actually have any user characters that need a place?
            if (rawValueArr.length > 0) {
                // We will keep chipping away at user input until either we run out of characters
                // or we find at least one character that we can map.
                while (rawValueArr.length > 0) {
                    // Let's retrieve the first user character in the queue of characters we have left
                    var _e = rawValueArr.shift(), rawValueChar = _e.char, isNew = _e.isNew;
                    // If the character we got from the user input is a placeholder character (which happens
                    // regularly because user input could be something like (540) 90_-____, which includes
                    // a bunch of `_` which are placeholder characters) and we are not in *no guide* mode,
                    // then we map this placeholder character to the current spot in the placeholder
                    if (rawValueChar === placeholderChar$$1 && suppressGuide !== true) {
                        conformedValue += placeholderChar$$1;
                        // And we go to find the next placeholder character that needs filling
                        continue placeholderLoop;
                        // Else if, the character we got from the user input is not a placeholder, let's see
                        // if the current position in the mask can accept it.
                    }
                    else if (mask[i].test(rawValueChar)) {
                        // we map the character differently based on whether we are keeping character positions or not.
                        // If any of the conditions below are met, we simply map the raw value character to the
                        // placeholder position.
                        if (keepCharPositions !== true ||
                            isNew === false ||
                            previousConformedValue === emptyString ||
                            guide === false ||
                            !isAddition) {
                            conformedValue += rawValueChar;
                        }
                        else {
                            // We enter this block of code if we are trying to keep character positions and none of the conditions
                            // above is met. In this case, we need to see if there's an available spot for the raw value character
                            // to be mapped to. If we couldn't find a spot, we will discard the character.
                            //
                            // For example, for mask `1111`, previous conformed value `_2__`, raw value `942_2__`. We can map the
                            // `9`, to the first available placeholder position, but then, there are no more spots available for the
                            // `4` and `2`. So, we discard them and end up with a conformed value of `92__`.
                            var /** @type {?} */ rawValueArrLength = rawValueArr.length;
                            var /** @type {?} */ indexOfNextAvailablePlaceholderChar = null;
                            // Let's loop through the remaining raw value characters. We are looking for either a suitable spot, ie,
                            // a placeholder character or a non-suitable spot, ie, a non-placeholder character that is not new.
                            // If we see a suitable spot first, we store its position and exit the loop. If we see a non-suitable
                            // spot first, we exit the loop and our `indexOfNextAvailablePlaceholderChar` will stay as `null`.
                            for (var /** @type {?} */ j = 0; j < rawValueArrLength; j++) {
                                var /** @type {?} */ charData = rawValueArr[j];
                                if (charData.char !== placeholderChar$$1 && charData.isNew === false) {
                                    break;
                                }
                                if (charData.char === placeholderChar$$1) {
                                    indexOfNextAvailablePlaceholderChar = j;
                                    break;
                                }
                            }
                            // If `indexOfNextAvailablePlaceholderChar` is not `null`, that means the character is not blocked.
                            // We can map it. And to keep the character positions, we remove the placeholder character
                            // from the remaining characters
                            if (indexOfNextAvailablePlaceholderChar !== null) {
                                conformedValue += rawValueChar;
                                rawValueArr.splice(indexOfNextAvailablePlaceholderChar, 1);
                                // If `indexOfNextAvailablePlaceholderChar` is `null`, that means the character is blocked. We have to
                                // discard it.
                            }
                            else {
                                i--;
                            }
                        }
                        // Since we've mapped this placeholder position. We move on to the next one.
                        continue placeholderLoop;
                    }
                    else {
                        someCharsRejected = true;
                    }
                }
            }
            // We reach this point when we've mapped all the user input characters to placeholder
            // positions in the mask. In *guide* mode, we append the left over characters in the
            // placeholder to the `conformedString`, but in *no guide* mode, we don't wanna do that.
            //
            // That is, for mask `(111)` and user input `2`, we want to return `(2`, not `(2__)`.
            if (suppressGuide === false) {
                conformedValue += placeholder.substr(i, placeholderLength);
            }
            // And we break
            break;
            // Else, the charInPlaceholder is not a placeholderChar. That is, we cannot fill it
            // with user input. So we just map it to the final output
        }
        else {
            conformedValue += charInPlaceholder;
        }
    }
    // The following logic is needed to deal with the case of deletion in *no guide* mode.
    //
    // Consider the silly mask `(111) /// 1`. What if user tries to delete the last placeholder
    // position? Something like `(589) /// `. We want to conform that to `(589`. Not `(589) /// `.
    // That's why the logic below finds the last filled placeholder character, and removes everything
    // from that point on.
    if (suppressGuide && isAddition === false) {
        var /** @type {?} */ indexOfLastFilledPlaceholderChar = null;
        // Find the last filled placeholder position and substring from there
        for (var /** @type {?} */ i = 0; i < conformedValue.length; i++) {
            if (placeholder[i] === placeholderChar$$1) {
                indexOfLastFilledPlaceholderChar = i;
            }
        }
        if (indexOfLastFilledPlaceholderChar !== null) {
            // We substring from the beginning until the position after the last filled placeholder char.
            conformedValue = conformedValue.substr(0, indexOfLastFilledPlaceholderChar + 1);
        }
        else {
            // If we couldn't find `indexOfLastFilledPlaceholderChar` that means the user deleted
            // the first character in the mask. So we return an empty string.
            conformedValue = emptyString;
        }
    }
    return { conformedValue: conformedValue, meta: { someCharsRejected: someCharsRejected } };
}

var defaultArray = [];
var emptyString$1 = '';
/**
 * @param {?} __0
 * @return {?}
 */
function adjustCaretPosition(_a) {
    var _b = _a.previousConformedValue, previousConformedValue = _b === void 0 ? emptyString$1 : _b, _c = _a.previousPlaceholder, previousPlaceholder = _c === void 0 ? emptyString$1 : _c, _d = _a.currentCaretPosition, currentCaretPosition = _d === void 0 ? 0 : _d, conformedValue = _a.conformedValue, rawValue = _a.rawValue, placeholderChar = _a.placeholderChar, placeholder = _a.placeholder, _e = _a.indexesOfPipedChars, indexesOfPipedChars = _e === void 0 ? defaultArray : _e, _f = _a.caretTrapIndexes, caretTrapIndexes = _f === void 0 ? defaultArray : _f;
    if (currentCaretPosition === 0) {
        return 0;
    }
    // Store lengths for faster performance?
    var /** @type {?} */ rawValueLength = rawValue.length;
    var /** @type {?} */ previousConformedValueLength = previousConformedValue.length;
    var /** @type {?} */ placeholderLength = placeholder.length;
    var /** @type {?} */ conformedValueLength = conformedValue.length;
    // This tells us how long the edit is. If user modified input from `(2__)` to `(243__)`,
    // we know the user in this instance pasted two characters
    var /** @type {?} */ editLength = rawValueLength - previousConformedValueLength;
    // If the edit length is positive, that means the user is adding characters, not deleting.
    var /** @type {?} */ isAddition = editLength > 0;
    // This is the first raw value the user entered that needs to be conformed to mask
    var /** @type {?} */ isFirstRawValue = previousConformedValueLength === 0;
    // A partial multi-character edit happens when the user makes a partial selection in their
    // input and edits that selection. That is going from `(123) 432-4348` to `() 432-4348` by
    // selecting the first 3 digits and pressing backspace.
    //
    // Such cases can also happen when the user presses the backspace while holding down the ALT
    // key.
    var /** @type {?} */ isPartialMultiCharEdit = editLength > 1 && !isAddition && !isFirstRawValue;
    // This algorithm doesn't support all cases of multi-character edits, so we just return
    // the current caret position.
    //
    // This works fine for most cases.
    if (isPartialMultiCharEdit) {
        return currentCaretPosition;
    }
    // For a mask like (111), if the `previousConformedValue` is (1__) and user attempts to enter
    // `f` so the `rawValue` becomes (1f__), the new `conformedValue` would be (1__), which is the
    // same as the original `previousConformedValue`. We handle this case differently for caret
    // positioning.
    var /** @type {?} */ possiblyHasRejectedChar = isAddition && (previousConformedValue === conformedValue ||
        conformedValue === placeholder);
    var /** @type {?} */ startingSearchIndex = 0;
    var /** @type {?} */ trackRightCharacter;
    var /** @type {?} */ targetChar;
    if (possiblyHasRejectedChar) {
        startingSearchIndex = currentCaretPosition - editLength;
    }
    else {
        // At this point in the algorithm, we want to know where the caret is right before the raw input
        // has been conformed, and then see if we can find that same spot in the conformed input.
        //
        // We do that by seeing what character lies immediately before the caret, and then look for that
        // same character in the conformed input and place the caret there.
        // First, we need to normalize the inputs so that letter capitalization between raw input and
        // conformed input wouldn't matter.
        var /** @type {?} */ normalizedConformedValue_1 = conformedValue.toLowerCase();
        var /** @type {?} */ normalizedRawValue = rawValue.toLowerCase();
        // Then we take all characters that come before where the caret currently is.
        var /** @type {?} */ leftHalfChars = normalizedRawValue.substr(0, currentCaretPosition).split(emptyString$1);
        // Now we find all the characters in the left half that exist in the conformed input
        // This step ensures that we don't look for a character that was filtered out or rejected by `conformToMask`.
        var /** @type {?} */ intersection = leftHalfChars.filter(function (char) { return normalizedConformedValue_1.indexOf(char) !== -1; });
        // The last character in the intersection is the character we want to look for in the conformed
        // value and the one we want to adjust the caret close to
        targetChar = intersection[intersection.length - 1];
        // Calculate the number of mask characters in the previous placeholder
        // from the start of the string up to the place where the caret is
        var /** @type {?} */ previousLeftMaskChars = previousPlaceholder
            .substr(0, intersection.length)
            .split(emptyString$1)
            .filter(function (char) { return char !== placeholderChar; })
            .length;
        // Calculate the number of mask characters in the current placeholder
        // from the start of the string up to the place where the caret is
        var /** @type {?} */ leftMaskChars = placeholder
            .substr(0, intersection.length)
            .split(emptyString$1)
            .filter(function (char) { return char !== placeholderChar; })
            .length;
        // Has the number of mask characters up to the caret changed?
        var /** @type {?} */ masklengthChanged = leftMaskChars !== previousLeftMaskChars;
        // Detect if `targetChar` is a mask character and has moved to the left
        var /** @type {?} */ targetIsMaskMovingLeft = (previousPlaceholder[intersection.length - 1] !== undefined &&
            placeholder[intersection.length - 2] !== undefined &&
            previousPlaceholder[intersection.length - 1] !== placeholderChar &&
            previousPlaceholder[intersection.length - 1] !== placeholder[intersection.length - 1] &&
            previousPlaceholder[intersection.length - 1] === placeholder[intersection.length - 2]);
        // If deleting and the `targetChar` `is a mask character and `masklengthChanged` is true
        // or the mask is moving to the left, we can't use the selected `targetChar` any longer
        // if we are not at the end of the string.
        // In this case, change tracking strategy and track the character to the right of the caret.
        if (!isAddition &&
            (masklengthChanged || targetIsMaskMovingLeft) &&
            previousLeftMaskChars > 0 &&
            placeholder.indexOf(targetChar) > -1 &&
            rawValue[currentCaretPosition] !== undefined) {
            trackRightCharacter = true;
            targetChar = rawValue[currentCaretPosition];
        }
        // It is possible that `targetChar` will appear multiple times in the conformed value.
        // We need to know not to select a character that looks like our target character from the placeholder or
        // the piped characters, so we inspect the piped characters and the placeholder to see if they contain
        // characters that match our target character.
        // If the `conformedValue` got piped, we need to know which characters were piped in so that when we look for
        // our `targetChar`, we don't select a piped char by mistake
        var /** @type {?} */ pipedChars = indexesOfPipedChars.map(function (index) { return normalizedConformedValue_1[index]; });
        // We need to know how many times the `targetChar` occurs in the piped characters.
        var /** @type {?} */ countTargetCharInPipedChars = pipedChars.filter(function (char) { return char === targetChar; }).length;
        // We need to know how many times it occurs in the intersection
        var /** @type {?} */ countTargetCharInIntersection = intersection.filter(function (char) { return char === targetChar; }).length;
        // We need to know if the placeholder contains characters that look like
        // our `targetChar`, so we don't select one of those by mistake.
        var /** @type {?} */ countTargetCharInPlaceholder = placeholder
            .substr(0, placeholder.indexOf(placeholderChar))
            .split(emptyString$1)
            .filter(function (char, index) { return (
        // Check if `char` is the same as our `targetChar`, so we account for it
        char === targetChar &&
            // but also make sure that both the `rawValue` and placeholder don't have the same character at the same
            // index because if they are equal, that means we are already counting those characters in
            // `countTargetCharInIntersection`
            rawValue[index] !== char); })
            .length;
        // The number of times we need to see occurrences of the `targetChar` before we know it is the one we're looking
        // for is:
        var /** @type {?} */ requiredNumberOfMatches = (countTargetCharInPlaceholder +
            countTargetCharInIntersection +
            countTargetCharInPipedChars +
            // The character to the right of the caret isn't included in `intersection`
            // so add one if we are tracking the character to the right
            (trackRightCharacter ? 1 : 0));
        // Now we start looking for the location of the `targetChar`.
        // We keep looping forward and store the index in every iteration. Once we have encountered
        // enough occurrences of the target character, we break out of the loop
        // If are searching for the second `1` in `1214`, `startingSearchIndex` will point at `4`.
        var /** @type {?} */ numberOfEncounteredMatches = 0;
        for (var /** @type {?} */ i = 0; i < conformedValueLength; i++) {
            var /** @type {?} */ conformedValueChar = normalizedConformedValue_1[i];
            startingSearchIndex = i + 1;
            if (conformedValueChar === targetChar) {
                numberOfEncounteredMatches++;
            }
            if (numberOfEncounteredMatches >= requiredNumberOfMatches) {
                break;
            }
        }
    }
    // At this point, if we simply return `startingSearchIndex` as the adjusted caret position,
    // most cases would be handled. However, we want to fast forward or rewind the caret to the
    // closest placeholder character if it happens to be in a non-editable spot. That's what the next
    // logic is for.
    // In case of addition, we fast forward.
    if (isAddition) {
        // We want to remember the last placeholder character encountered so that if the mask
        // contains more characters after the last placeholder character, we don't forward the caret
        // that far to the right. Instead, we stop it at the last encountered placeholder character.
        var /** @type {?} */ lastPlaceholderChar = startingSearchIndex;
        for (var /** @type {?} */ i = startingSearchIndex; i <= placeholderLength; i++) {
            if (placeholder[i] === placeholderChar) {
                lastPlaceholderChar = i;
            }
            if (
            // If we're adding, we can position the caret at the next placeholder character.
            placeholder[i] === placeholderChar ||
                // If a caret trap was set by a mask function, we need to stop at the trap.
                caretTrapIndexes.indexOf(i) !== -1 ||
                // This is the end of the placeholder. We cannot move any further. Let's put the caret there.
                i === placeholderLength) {
                return lastPlaceholderChar;
            }
        }
    }
    else {
        // In case of deletion, we rewind.
        if (trackRightCharacter) {
            // Searching for the character that was to the right of the caret
            // We start at `startingSearchIndex` - 1 because it includes one character extra to the right
            for (var /** @type {?} */ i = startingSearchIndex - 1; i >= 0; i--) {
                // If tracking the character to the right of the cursor, we move to the left until
                // we found the character and then place the caret right before it
                if (
                // `targetChar` should be in `conformedValue`, since it was in `rawValue`, just
                // to the right of the caret
                conformedValue[i] === targetChar ||
                    // If a caret trap was set by a mask function, we need to stop at the trap.
                    caretTrapIndexes.indexOf(i) !== -1 ||
                    // This is the beginning of the placeholder. We cannot move any further.
                    // Let's put the caret there.
                    i === 0) {
                    return i;
                }
            }
        }
        else {
            // Searching for the first placeholder or caret trap to the left
            for (var /** @type {?} */ i = startingSearchIndex; i >= 0; i--) {
                // If we're deleting, we stop the caret right before the placeholder character.
                // For example, for mask `(111) 11`, current conformed input `(456) 86`. If user
                // modifies input to `(456 86`. That is, they deleted the `)`, we place the caret
                // right after the first `6`
                if (
                // If we're deleting, we can position the caret right before the placeholder character
                placeholder[i - 1] === placeholderChar ||
                    // If a caret trap was set by a mask function, we need to stop at the trap.
                    caretTrapIndexes.indexOf(i) !== -1 ||
                    // This is the beginning of the placeholder. We cannot move any further.
                    // Let's put the caret there.
                    i === 0) {
                    return i;
                }
            }
        }
    }
}

var FormatterParser = (function () {
    function FormatterParser() {
    }
    /**
     * @param {?} searchValue
     * @param {?} replaceValue
     * @return {?}
     */
    FormatterParser.replaceString = function (searchValue, replaceValue) {
        return function (value) {
            var /** @type {?} */ transformedValue = value;
            /* istanbul ignore else */
            if (typeof transformedValue === 'string' || transformedValue instanceof String) {
                transformedValue = transformedValue.replace(searchValue, replaceValue);
            }
            var /** @type {?} */ result = {
                name: 'replaceString',
                result: transformedValue,
                previous: value
            };
            return result;
        };
    };
    /**
     * @param {?=} mask
     * @param {?=} config
     * @return {?}
     */
    FormatterParser.conformToMask = function (mask, config) {
        if (mask === void 0) { mask = []; }
        return function (value) {
            var /** @type {?} */ result = {
                name: 'conformToMask',
                result: value,
                previous: value
            };
            /* istanbul ignore else */
            if (mask && config) {
                /* istanbul ignore conditional */
                value = (typeof value === 'string' || value instanceof String) ? value : '';
                var /** @type {?} */ subResult = conformToMask(value, mask, config);
                result.result = subResult.conformedValue;
                result.meta = subResult.meta;
            }
            return result;
        };
    };
    return FormatterParser;
}());
FormatterParser.toUpperCase = function (value) {
    var /** @type {?} */ transformedValue = value;
    /* istanbul ignore else */
    if (typeof value === 'string' || value instanceof String) {
        transformedValue = value.toUpperCase();
    }
    return {
        name: 'toUpperCase',
        result: transformedValue,
        previous: value
    };
};
FormatterParser.toLowerCase = function (value) {
    var /** @type {?} */ transformedValue = value;
    /* istanbul ignore else */
    if (typeof transformedValue === 'string' || transformedValue instanceof String) {
        transformedValue = transformedValue.toLowerCase();
    }
    return {
        name: 'toLowerCase',
        result: transformedValue,
        previous: value
    };
};
FormatterParser.toCapitalized = function (value) {
    var /** @type {?} */ transformedValue = value;
    /* istanbul ignore else */
    if (typeof value === 'string' || value instanceof String) {
        transformedValue = transformedValue
            .toLowerCase()
            .split(' ')
            .map(function (val) { return val.charAt(0).toUpperCase() + val.slice(1); })
            .join(' ');
    }
    return {
        name: 'toCapitalized',
        result: transformedValue,
        previous: value
    };
};

var FORMATTER_PARSER = new _angular_core.InjectionToken('formatterParser');

var FormatterParserService = (function () {
    /**
     * @param {?} FORMATTER_PARSER
     */
    function FormatterParserService(FORMATTER_PARSER$$1) {
        this.FORMATTER_PARSER = FORMATTER_PARSER$$1;
    }
    /**
     * @param {?} functionName
     * @param {?=} params
     * @return {?}
     */
    FormatterParserService.prototype.getFormatParseFunction = function (functionName, params) {
        var /** @type {?} */ formatParseFunction;
        if (functionName in FormatterParser) {
            formatParseFunction = FormatterParser[functionName];
        }
        else if (this.FORMATTER_PARSER) {
            formatParseFunction = this.FORMATTER_PARSER.find(function (formParsFunc) {
                return functionName === formParsFunc.name;
            });
        }
        if (!(typeof formatParseFunction === 'function')) {
            throw new Error("Formatter or Parser with name " + functionName + " \n                            is not provided as a function via FormatterParser \n                            service or FORMATTER_PARSER InjectionToken. \n                            Did you forgot to provide them?");
        }
        return (params) ? formatParseFunction.apply(void 0, params) : formatParseFunction;
    };
    return FormatterParserService;
}());
FormatterParserService.decorators = [
    { type: _angular_core.Injectable },
];
/**
 * @nocollapse
 */
FormatterParserService.ctorParameters = function () { return [
    { type: Array, decorators: [{ type: _angular_core.Optional }, { type: _angular_core.Inject, args: [FORMATTER_PARSER,] },] },
]; };

var InputContextService = (function () {
    function InputContextService() {
        this.previousConformedValue = '';
        this.previousPlaceholder = '';
        this.currentCaretPosition = 0;
        this.conformedValue = '';
        this.rawValue = '';
        this.placeholderChar = '_';
        this.placeholder = '_';
        this.indexesOfPipedChars = [];
        this.caretTrapIndexes = [];
    }
    /**
     * @param {?} input
     * @return {?}
     */
    InputContextService.prototype.setSelection = function (input) {
        var /** @type {?} */ adjustCaretConfig = {
            previousConformedValue: this.previousConformedValue,
            previousPlaceholder: this.previousPlaceholder,
            currentCaretPosition: this.currentCaretPosition,
            conformedValue: this.conformedValue,
            rawValue: this.rawValue,
            placeholderChar: this.placeholderChar,
            placeholder: this.placeholder,
            indexesOfPipedChars: this.indexesOfPipedChars,
            caretTrapIndexes: this.caretTrapIndexes
        };
        var /** @type {?} */ selectionPosition = adjustCaretPosition(adjustCaretConfig);
        // input.setSelectionRange(selectionPosition, selectionPosition, 'none')
    };
    return InputContextService;
}());
InputContextService.decorators = [
    { type: _angular_core.Injectable },
];
/**
 * @nocollapse
 */
InputContextService.ctorParameters = function () { return []; };

var CONTROL_VALUE_ACCESSOR = {
    name: 'formatterParserValueAccessor',
    provide: _angular_forms.NG_VALUE_ACCESSOR,
    useExisting: _angular_core.forwardRef(function () { return FormatterParserDirective; }),
    multi: true
};
var FormatterParserDirective = (function () {
    /**
     * @param {?} _elementRef
     * @param {?} fps
     * @param {?} inputContext
     */
    function FormatterParserDirective(_elementRef, fps, inputContext) {
        this._elementRef = _elementRef;
        this.fps = fps;
        this.inputContext = inputContext;
        this.formatterParserView = [];
        this.formatterParserModel = [];
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    FormatterParserDirective.prototype.registerOnTouched = function (fn) {
        this.onTouch = fn;
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    FormatterParserDirective.prototype.registerOnChange = function (fn) {
        this.onModelChange = fn;
    };
    /**
     * @return {?}
     */
    FormatterParserDirective.prototype.ngAfterViewInit = function () {
        this.inputElement = this.getInputElementRef();
        this.updateFormatterAndParser();
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    FormatterParserDirective.prototype.onControlInput = function ($event) {
        var /** @type {?} */ rawValue = this.inputElement.value;
        // If there is a reactive FormControl present trigger onTouch
        /* istanbul ignore else */
        if (this.onTouch) {
            this.onTouch();
        }
        // write value to view (visible text of the form control)
        this.inputElement.value = this.formatterParserView
            .reduce(function (state, transform) { return transform(state).result; }, rawValue || null);
        // write value to model (value stored in FormControl)
        var /** @type {?} */ modelValue = this.formatterParserModel
            .reduce(function (state, transform) { return transform(state).result; }, rawValue || null);
        // If there is a reactive formControl present update its model
        /* istanbul ignore else */
        if (this.onModelChange) {
            this.onModelChange(modelValue);
        }
        // refocus cursor to propper position after input
        this.inputContext.setSelection(this.inputElement);
    };
    /**
     * @param {?} rawValue
     * @return {?}
     */
    FormatterParserDirective.prototype.writeValue = function (rawValue) {
        // write value to view (visible text of the form control)
        if (this.inputElement) {
            this.inputElement.value = this.formatterParserView
                .reduce(function (state, transform) { return transform(state).result; }, rawValue);
        }
        // write value to model (value stored in FormControl)
        var /** @type {?} */ modelValue = this.formatterParserModel
            .reduce(function (state, transform) { return transform(state).result; }, rawValue);
        // prevent cyclic function calls
        if (rawValue !== modelValue) {
            // If there is a reactive FormControl present update its model
            /* istanbul ignore else */
            if (this.onModelChange) {
                this.onModelChange(modelValue);
            }
        }
    };
    /**
     * @return {?}
     */
    FormatterParserDirective.prototype.updateFormatterAndParser = function () {
        var _this = this;
        this.formatterParserView = [];
        this.formatterParserModel = [];
        /* istanbul ignore else */
        if (!this.formatterParser) {
            return;
        }
        /* istanbul ignore else */
        if ('formatterParser' in this.formatterParser) {
            // setup formatterParser functions for view and model values
            this.formatterParser.formatterParser
                .forEach(function (formatterConfig) {
                var /** @type {?} */ targetBoth = 2;
                var /** @type {?} */ fPF = _this.fps.getFormatParseFunction(formatterConfig.name, formatterConfig.params);
                var /** @type {?} */ t = (formatterConfig.target === undefined) ? targetBoth : formatterConfig.target;
                // Formatter: Model to View
                if (t === 1 || t === 2) {
                    _this.formatterParserModel.push(fPF);
                }
                // Parser: View to Model
                if ((t === 0 || t === 2)) {
                    _this.formatterParserView.push(fPF);
                }
            });
        }
    };
    /**
     * @return {?}
     */
    FormatterParserDirective.prototype.getInputElementRef = function () {
        var /** @type {?} */ input;
        if (this._elementRef.nativeElement.tagName === 'INPUT') {
            // `textMask` directive is used directly on an input element
            input = this._elementRef.nativeElement;
        }
        else {
            // `formatterParser` directive is used on an abstracted input element, `ion-input`, `md-input`, etc
            input = this._elementRef.nativeElement.getElementsByTagName('INPUT')[0];
        }
        if (!input) {
            throw new Error('You can applied the "formatterParser" directive only on inputs or elements containing inputs');
        }
        return input;
    };
    return FormatterParserDirective;
}());
FormatterParserDirective.decorators = [
    { type: _angular_core.Directive, args: [{
                selector: '[formatterParser]',
                providers: [
                    CONTROL_VALUE_ACCESSOR
                ]
            },] },
];
/**
 * @nocollapse
 */
FormatterParserDirective.ctorParameters = function () { return [
    { type: _angular_core.ElementRef, },
    { type: FormatterParserService, },
    { type: InputContextService, },
]; };
FormatterParserDirective.propDecorators = {
    'formatterParser': [{ type: _angular_core.Input },],
    'formControlName': [{ type: _angular_core.Input },],
    'onControlInput': [{ type: _angular_core.HostListener, args: ['input', ['$event'],] },],
};

var FormatterParserModule = (function () {
    function FormatterParserModule() {
    }
    /**
     * @return {?}
     */
    FormatterParserModule.forRoot = function () {
        return {
            ngModule: FormatterParserModule,
            providers: [
                FormatterParserService,
                FormatterParser,
                InputContextService
            ]
        };
    };
    return FormatterParserModule;
}());
FormatterParserModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                imports: [
                    _angular_common.CommonModule,
                    _angular_forms.ReactiveFormsModule
                ],
                declarations: [FormatterParserDirective],
                exports: [FormatterParserDirective, _angular_forms.ReactiveFormsModule]
            },] },
];
/**
 * @nocollapse
 */
FormatterParserModule.ctorParameters = function () { return []; };

exports.FormatterParserModule = FormatterParserModule;
exports.FormatterParserDirective = FormatterParserDirective;
exports.FormatterParserService = FormatterParserService;
exports.FormatterParser = FormatterParser;
exports.FORMATTER_PARSER = FORMATTER_PARSER;
exports.InputContextService = InputContextService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
