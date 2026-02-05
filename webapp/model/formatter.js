sap.ui.define([], function () {
    "use strict";
    return {
        /**
         * Concatenates first and last name and returns them in UpperCase
         * @param {string} sFirst First Name
         * @param {string} sLast Last Name
         * @returns {string} Combined Full Name
         */
        formatFullName: function (sFirst, sLast) {
            if (!sFirst || !sLast) {
                return sFirst || sLast || "";
            }
            return sFirst.toUpperCase() + " " + sLast.toUpperCase();
        }
    };
});
