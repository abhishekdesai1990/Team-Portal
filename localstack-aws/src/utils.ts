import moment from "moment-timezone";

export const getDateSevenDaysLaterWithTimeAdjustedToBatch = (): string =>
  moment()
    .tz("Europe/London")
    .add(7, "days")
    .endOf("day")
    .format("D MMMM YYYY [at 11:59 pm]");
