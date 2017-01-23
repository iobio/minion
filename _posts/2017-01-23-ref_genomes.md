---
layout: post
title: Reference genomes
image: /public/images/blog/grch38/main.png
subtitle: Using alternate references
tags:
  - Alistair Ward
  - gene.iobio
---

The latest release of <a href="http://gene.iobio.io/" target="_blank">gene.iobio</a> includes the ability to use the GRCh38 human reference genome for analysis. This is only a quick post, because we will soon be releasing a major update to gene.iobio, version 2.2.0, which includes significant updates to both the appearance and functionality.

Now, when you use gene.iobio, you will see that when you define your input data, you can choose from a list of available of reference genomes from the "Genome Build" menu. Currently, only GRCh37 and GRCh38 human reference genomes are available, but if you would like to see other genomes, please contact us at this <a href="mailto:iobioproject@gmail.com" subject="gene.iobio suggestions">address</a>.

<div><img src="/public/images/blog/grch38/data_input.png" style="width:60%; margin:40px 0px 40px 160px;"></div>

If you do not specifically pick a reference genome, gene.iobio will attempt to identify the build used from the headers of the selected files. If the build cannot be determined, however, gene.iobio will prompt to you to manually specify the genome to use.

Now keep your eyes peeled for the next upcoming release of gene that we are really excited about!
