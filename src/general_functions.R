# misc R functions used in scripts in scripts in this repository


# factors -----------------------------------------------------------------

# convert numeric code to SEI class. 
# from2digit is a logical, if true SEI class is extracted
# from a 2 digit code, where the first digit is SEI class second is RR
code2c3 <- function(x, from2digit = FALSE) {
  if(from2digit) {
    stopifnot(x > 10 & x < 100)
    x <- as.numeric(as.character(str_extract(x, '^\\d')))
  }
  stopifnot(x %in% 1:3)
  factor(x, levels = 1:3,
         labels = c('CSA', 'GOA', 'ORA'))
}

# convert numeric code to SEI class
# from2digit is a logical, where rr class is extracted
# from a 2 digit code, where the first digit is SEI class second is RR
code2rr <- function(x, from2digit = FALSE) {
  
  if(from2digit) {
    stopifnot(x > 10 & x < 100)
    x <- as.numeric(as.character(str_extract(x, '\\d$')))
  }
  stopifnot(x %in% 1:4)
  factor(x, levels = 4:1,
         labels = c("MH-H", "M", "ML", "L"))
}

# x is vector with 2 digits numbers, first is SEI class,
# second is RR class, returns factor with those codes
# named
code2c3rr <- function(x) {
  possible_vals <- as.numeric(paste0(rep(1:3, each = 4), rep(4:1, 3)))
  
  stopifnot(x %in% possible_vals)
  
  levels <- paste(code2c3(possible_vals, from2digit = TRUE), 
                  code2rr(possible_vals, from2digit = TRUE), sep = ',')
  c3 <- code2c3(x, from2digit = TRUE)
  rr <- code2rr(x, from2digit = TRUE)
  c3Rr_name  <- factor(paste(c3, rr, sep = ','),
                       levels = levels)
  c3Rr_name
}

rrcat2factor <- function(x) {
  stopifnot(x %in% c('Resil-cats', 'Resist-cats'))
  factor(x, levels = c('Resil-cats', 'Resist-cats'),
         labels = c('Resilience', 'Resistance'))
}
