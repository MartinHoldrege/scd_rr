# functions that operate on dataframes (generally for data summarizing/preparing
# steps of workflows)

source('src/general_functions.R')

# df is a dataframe that includes a c3Rr column (two digit code)
# returns same dataframe but with new c3, RR, and c3Rr_name cols
create_c3_rr_cols <- function(df) {
  
  stopifnot('c3RrHist_C3RrFut' %in% names(df),
            # don't want to cols being created to already
            #exist
            !c('c3', 'RR', 'c3Rr_name') %in% names(df))
  
  x <- df$c3RrHist_C3RrFut
  
  c3_vals <- 1:3 # possible c3 levels
  rr_vals <- 1:3 # possible rr levels
  
  possible_values <- expand_grid(a = c3_vals, b = rr_vals, c = c3_vals, 
                                 d = rr_vals) %>% 
    rowwise() %>% 
    mutate(code = paste0(a, b, c, d)) %>% 
    pull(code) %>% 
    as.numeric()
  
  x_char <- as.character(x)
  
  # first twho numbers refer to the c3 and rr during the historical period
  code_hist <- as.numeric(str_extract(x_char, '^\\d{2}'))
  
  # last two numbers refer to the c3 and rr during the future period
  code_fut <- as.numeric(str_extract(x_char, '\\d{2}$'))
  
  df$c3_hist <- code2c3(code_hist, from2digit = TRUE)
  df$RR_hist <- code2rr(code_hist, from2digit = TRUE)
  
  df$c3_fut <- code2c3(code_fut, from2digit = TRUE)
  df$RR_fut <- code2rr(code_fut, from2digit = TRUE)
  
  df$c3Rr_hist  <- code2c3rr(code_hist)
  df$c3Rr_fut  <- code2c3rr(code_fut)
  
  df
}
