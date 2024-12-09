# Purpose: Visualize the area in each combination of current and projected
# SEI class and R&R class

# Author: Martin Holdrege

# Script started: December 9, 2024


# dependencies ------------------------------------------------------------

library(tidyverse)
source('src/dataframes.R')
source('src/fig_functions.R')
source('src/fig_params.R')
theme_set(theme_custom1())

# read in data ------------------------------------------------------------

area1 <- read_csv('data_processed/area/area_c3rr_v1.csv',
                  show_col_types = FALSE)

# prepare data ------------------------------------------------------------

area2 <- area1 %>% 
  select(-`system:index`, -`.geo`)

area3 <- create_c3_rr_cols(area2) %>% # add factor columns
  mutate(variableRR = rrcat2factor(variableRR))


# fig funs --------------------------------------------------------------

rotate_x <- function() {
    theme(axis.text.x = element_text(angle = 45, hjust = 1))
}

fill_rr <- function(name = 'R&R') {
  scale_fill_manual(values = cols_rrcat, name = name)
}

base1 <- function() {
  list(
    labs(y = 'Area (ha)',
         caption = 'Area calculated based on predicted median SEI and RR classes across GCMs')
  )
}
  
# create figures ----------------------------------------------------------

gf1  <- function(variableRR) {
  ggplot(area3[area3$variableRR == variableRR,]) +
    geom_bar(aes(c3, area_ha, fill = RR),
             stat = "identity", position = 'dodge') +
    facet_wrap(~scenario) +
    rotate_x() + 
    fill_rr(name = variableRR) +
    base1() +
    labs(x = 'SEI class')
}

pdf('figures/area/c3rr_area-by-scenario_v1.pdf',
    height = 7, width = 8)
gf1('Resilience')
gf1('Resistance')


g <- ggplot(area3, 
       aes(scenario, area_ha, fill = variableRR)) +
  geom_bar(stat = "identity", position = 'dodge') +
  rotate_x() +
  base1() +
  theme(legend.title = element_blank())
g + facet_grid(c3~RR)
g + facet_grid(c3~RR, scales = 'free_y')


dev.off()
