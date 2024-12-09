# functions that operate on dataframes (generally for data summarizing/preparing
# steps of workflows)

source('src/general_functions.R')

# df is a dataframe that includes a c3Rr column (two digit code)
# returns same dataframe but with new c3, RR, and c3Rr_name cols
create_c3_rr_cols <- function(df) {
  
  stopifnot('c3Rr' %in% names(df),
            # don't want to cols being created to already
            #exist
            !c('c3', 'RR', 'c3Rr_name') %in% names(df))
  
  df$c3 <- code2c3(df$c3Rr, from2digit = TRUE)
  df$RR <- code2rr(df$c3Rr, from2digit = TRUE)
  
  df$c3Rr_name  <- code2c3rr(df$c3Rr)
  
  df
}
