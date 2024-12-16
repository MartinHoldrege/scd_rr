# functions for figure creation

theme_custom1 <- function() {
  theme_bw() %+replace%
    theme(panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(), 
          axis.line = element_line(colour = "black"),
          strip.background = element_blank())
}


rotate_x <- function() {
  theme(axis.text.x = element_text(angle = 45, hjust = 1))
}

fill_rr <- function(name = 'R&R') {
  scale_fill_manual(values = cols_rrcat, name = name)
}