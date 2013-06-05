#!/usr/bin/Rscript
sink("/dev/null")
library(gdsfmt)
suppressMessages(library(SNPRelate))
library(rjson)
args <- commandArgs(trailingOnly = TRUE)

# theFifo <- fifo(description=args[1], open="read") 
vcf.fn <- args[1]
gds.fn <- paste("cache/",args[2], sep="")
mr.in <- as.numeric(args[3])
maf.in <- as.numeric(args[4])

   
# vcf.fn <- "/Users/chase/Tools/freebayes/data/yri_ceu.chr20.1000000_1050000.recode.vcf"

# Modified snpgdsVCF2GDS to only read through the VCF file/stream once, instead of 3 times
# CAN ONLY DO A SINGLE VCF FILE.
# CAN ONLY DO BIALLELIC
# CAN ONLY DO sample.order can't do snpfirstdim
# Can now work with fifo.
mysnpgdsVCF2GDS <- function(vcf.fn, outfn.gds, nblock=1024,
	method = c("biallelic.only", "copy.num.of.ref"),
	compress.annotation="ZIP.max", snpfirstdim=FALSE, option = NULL,
	verbose=TRUE)
{
	# check
	stopifnot(is.character(vcf.fn))
	stopifnot(is.character(outfn.gds))
	stopifnot(is.logical(snpfirstdim) & (length(snpfirstdim)==1))

	method <- match.arg(method)
	if (is.null(option)) option <- snpgdsOption()



	######################################################################
	# Scan VCF file -- get sample id

	scan.vcf.sampid <- function(fn, method, start)
	{
	
		# matching codes
		geno.str <- c("0|0", "0|1", "1|0", "1|1", "0/0", "0/1", "1/0", "1/1",
			"0", "1",
			"0|0|0", "0|0|1", "0|1|0", "0|1|1", "1|0|0", "1|0|1", "1|1|0", "1|1|1",
			"0/0/0", "0/0/1", "0/1/0", "0/1/1", "1/0/0", "1/0/1", "1/1/0", "1/1/1")
		geno.code <- as.integer(c(2, 1, 1, 0, 2, 1, 1, 0,
			1, 0,
			2, 1, 1, 1, 1, 1, 1, 0, 
			2, 1, 1, 1, 1, 1, 1, 0))
			
		# open the vcf file
		opfile <- file(fn, open="r")

		# read header
		fmtstr <- substring(readLines(opfile, n=1), 3)
		samp.id <- NULL
		while (length(s <- readLines(opfile, n=1)) > 0)
		{
			if (substr(s, 1, 6) == "#CHROM")
			{
				samp.id <- scan(text=s, what=character(0), sep="\t", quiet=TRUE)[-c(1:9)]
				break
			}
		}
		if (is.null(samp.id))
		{
			close(opfile)
			stop("Error VCF format: invalid sample id!")
		}
		
		chr <- vector(); position <- vector()
      snpidx <- vector(); snp.rs <- vector()
      snp.allele <- vector()
      
		snp.cnt <- 0; var.cnt <- 0; genosnp.cnt <- start
		gxs = list();

		if (method == "biallelic.only")
		{
			while (length(s <- readLines(opfile, n=nblock)) > 0)
			{
			   gx <- NULL
				for (i in 1:length(s))
				{
					var.cnt <- var.cnt + 1
					ss <- scan(text=s[i], what=character(0), sep="\t", quiet=TRUE, n=5)
					if (all(ss[c(4,5)] %in% c("A", "G", "C", "T", "a", "g", "c", "t")))
					{
						snp.cnt <- snp.cnt + 1
						chr[snp.cnt] <- ss[1]
						position[snp.cnt] <- as.integer(ss[2])
						snpidx[snp.cnt] <- var.cnt
						snp.rs[snp.cnt] <- ss[3]
						snp.allele[snp.cnt] <- paste(ss[4], ss[5], sep="/")
						
						# geno
						ss <- scan(text=s[i], what=character(0), sep="\t", quiet=TRUE)[-c(1:9)]
						ss <- sapply(strsplit(ss, ":"), FUN = function(x) x[1])
						x <- match(ss, geno.str)
						x <- geno.code[x]
						x[is.na(x)] <- as.integer(3)
						gx <- cbind(gx, x)
					}
				}
				if (!is.null(gx))
				{
					if (snpfirstdim)
						write.gdsn(gGeno, t(gx), start=c(genosnp.cnt,1), count=c(ncol(gx),-1))
					else {
						gxs[[length(gxs)+1]] = list('gx' = gx, 'start' = c(1,genosnp.cnt), 'count' = c(-1,ncol(gx)))
						#write.gdsn(gGeno, gx, start=c(1,genosnp.cnt), count=c(-1,ncol(gx)))
					}
					genosnp.cnt <- genosnp.cnt + ncol(gx)
				}
				# chromosomes
      		chr <- chr[1:snp.cnt]
      		flag <- match(chr, names(option$chromosome.code))
      		chr[!is.na(flag)] <- unlist(option$chromosome.code)[ flag[!is.na(flag)] ]
      		chr <- suppressWarnings(as.integer(chr))
      		chr[is.na(chr)] <- -1

      		snp.allele <- gsub(".", "/", snp.allele[1:snp.cnt], fixed=TRUE)
      		marker = list(chr = chr, position = position[1:snp.cnt],
      			snpidx = snpidx[1:snp.cnt], snp.rs = snp.rs[1:snp.cnt],
      			snp.allele = snp.allele
      		)


            results <- list( 'sampid' = samp.id, 'marker' = marker, 'gxs' = gxs)
            gds.fn <- paste(snp.cnt,".gds", sep="")
            writeGds(gds.fn, results)            
            runPca(gds.fn)
            unlink(gds.fn)
			}
		} else {
			while (length(s <- readLines(opfile, n=nblock)) > 0)
			{
				for (i in 1:length(s))
				{
					var.cnt <- var.cnt + 1
					ss <- scan(text=s[i], what=character(0), sep="\t", quiet=TRUE, n=5)
					snp.cnt <- snp.cnt + 1
					chr[snp.cnt] <- ss[1]
					position[snp.cnt] <- as.integer(ss[2])
					snpidx[snp.cnt] <- var.cnt
					snp.rs[snp.cnt] <- ss[3]
					snp.allele[snp.cnt] <- paste(ss[4], ss[5], sep="/")
				}
			}
		}		

		# close the file
		close(opfile)


		# chromosomes
		chr <- chr[1:snp.cnt]
		flag <- match(chr, names(option$chromosome.code))
		chr[!is.na(flag)] <- unlist(option$chromosome.code)[ flag[!is.na(flag)] ]
		chr <- suppressWarnings(as.integer(chr))
		chr[is.na(chr)] <- -1

		snp.allele <- gsub(".", "/", snp.allele[1:snp.cnt], fixed=TRUE)
		marker = list(chr = chr, position = position[1:snp.cnt],
			snpidx = snpidx[1:snp.cnt], snp.rs = snp.rs[1:snp.cnt],
			snp.allele = snp.allele
		)
      
      
      results <- list( 'sampid' = samp.id, 'marker' = marker, 'gxs' = gxs)
		return(results)
	}
	
	#######################################
	# write gds
	
	writeGds <- function(outfn.gds, myResults)
   {
   	s <- myResults$sampid 
   	if (!is.null(sample.id))
   	{
   		if (length(sample.id) != length(s))
   			stop("All VCF files should have the same sample id.")
   		if (any(sample.id != s))
   			stop("All VCF files should have the same sample id.")
   	} else
   		sample.id <- s
   
      ####################################
   	# genetic markers
	
      v <- myResults$marker

   	all.chr <- c(all.chr, v$chr)
   	all.position <- c(all.position, v$position)
   	all.snpidx <- c(all.snpidx, v$snpidx)
   	all.snp.rs <- c(all.snp.rs, v$snp.rs)
   	all.snp.allele <- c(all.snp.allele, v$snp.allele)

   	####################################
   	# genetic variants

   	nSamp <- length(sample.id)
   	nSNP <- length(all.chr)
   	if (verbose)
   	{
   		cat(date(), "\tstore sample id, snp id, position, and chromosome.\n")
   		cat(sprintf("\tstart writing: %d samples, %d SNPs ...\n", nSamp, nSNP))
   	}


   	######################################################################
   	# create GDS file
   	#
   	gfile <- createfn.gds(outfn.gds)

   	# add "sample.id"
   	add.gdsn(gfile, "sample.id", sample.id, compress=compress.annotation, closezip=TRUE)
   	# add "snp.id"
   	add.gdsn(gfile, "snp.id", as.integer(all.snpidx), compress=compress.annotation, closezip=TRUE)
   	# add "snp.rs.id"
   	add.gdsn(gfile, "snp.rs.id", all.snp.rs, compress=compress.annotation, closezip=TRUE)
   	# add "snp.position"
   	add.gdsn(gfile, "snp.position", all.position, compress=compress.annotation, closezip=TRUE)
   	# add "snp.chromosome"
   	v.chr <- add.gdsn(gfile, "snp.chromosome", all.chr, storage="int32", compress=compress.annotation, closezip=TRUE)
   	# add "snp.allele"
   	add.gdsn(gfile, "snp.allele", all.snp.allele, compress=compress.annotation, closezip=TRUE)
	

   	# snp.chromosome
   	put.attr.gdsn(v.chr, "autosome.start", option$autosome.start)
   	put.attr.gdsn(v.chr, "autosome.end", option$autosome.end)
   	for (i in 1:length(option$chromosome.code))
   	{
   		put.attr.gdsn(v.chr, names(option$chromosome.code)[i],
   			option$chromosome.code[[i]])
   	}

   	# sync file
   	sync.gds(gfile)

   	# add "gonetype", 2 bits to store one genotype
   	if (snpfirstdim)
   	{
   		gGeno <- add.gdsn(gfile, "genotype", storage="bit2", valdim=c(nSNP, nSamp))
   		put.attr.gdsn(gGeno, "snp.order")
   	} else {
   		gGeno <- add.gdsn(gfile, "genotype", storage="bit2", valdim=c(nSamp, nSNP))
   		put.attr.gdsn(gGeno, "sample.order")
   	}
   	# sync file
   	sync.gds(gfile)


   	####################################
   	# genetic genotypes

   	snp.start <- 1
   	#for (fn in vcf.fn)
   	#{
   		if (verbose)
   			cat(sprintf("\tfile: %s\n", vcf.fn))
   		# s <- scan.vcf.geno(vcf.fn, gGeno, method, start=snp.start)
   		#      snp.start <- snp.start + s    
   	gxs <- myResults$gxs
   	for (i in 1:length(gxs))
   	{
   	   write.gdsn(gGeno, gxs[[i]]$gx, start=gxs[[i]]$start, count=gxs[[i]]$count)
   	}
   	sync.gds(gfile)  # sync file
   	#}


   	# close files
   	closefn.gds(gfile)
   }
   
   runPca <- function(outfn.gds) {
      (genofile <- openfn.gds(outfn.gds))
     # snpset <- snpgdsLDpruning(genofile, ld.threshold=ld.in)
     # snpset.id <- unlist(snpset)
     #  invisible(pca <- snpgdsPCA(genofile, maf=maf.in, missing.rate=0.05,snp.id=snpset.id, num.thread=3))
      invisible(pca <- snpgdsPCA(genofile, maf=maf.in, missing.rate=mr.in, num.thread=4))
      # pop_code <- scan("/Users/chase/Tools/freebayes/data/CEU_YRI_pop.txt", what=character())
      # #pop_code <- scan("pop_cont.txt", what=character())
      # pop_code <- c('CEU','CEU','CEU','CEU','CEU','CEU','CEU','CEU','CEU','CEU', 'YRI','YRI','YRI','YRI','YRI','YRI','YRI','YRI','YRI','YRI', 'GBR','GBR','GBR','GBR','GBR','GBR','GBR','GBR','GBR','GBR')
      # race <- as.factor(pop_code)
      # plot(pca$eigenvect[,2], pca$eigenvect[,1], xlab="Principal Component 2",ylab="Principal Component 1", type="n")
      # points(pca$eigenvect[,2], pca$eigenvect[,1], col=rainbow(max(1:nlevels(race)))[race])
      # legend("topleft", legend=levels(race), text.col=rainbow(max(1:nlevels(race)))[1:nlevels(race)])
      tmp <- structure(list(ev2 = signif(pca$eigenvect[,2], digits=3) , ev1 = signif(pca$eigenvect[,1],digits=3))) 

      #cat(toJSON(tmp))
      #cat(toJSON(pca$eigenvect))
      #print(pca)
       mat1 <- cbind(pca$eigenvect[,1:2], pca$sample.id)
       sink() 
       cat(apply(mat1, 1, paste, collapse=","), sep="\t")
       cat("\n")
      sink("/dev/null")
      
   }

	######################################################################
	######################################################################
	# Starting ...
	######################################################################
	######################################################################

	if (verbose)
	{
		cat("Start snpgdsVCF2GDS ...\n")
		if (method == "biallelic.only")
			cat("\tExtracting bi-allelic and polymorhpic SNPs.\n")
		else
			cat("\tStoring dosage of the reference allele for all variant sites, including bi-allelic SNPs, multi-allelic SNPs, indels and structural variants.\n")
		cat("\tScanning ...\n")
	}

	sample.id <- NULL
	all.chr <- integer()
	all.position <- integer()
	all.snpidx <- integer()
	all.snp.rs <- character()
	all.snp.allele <- character()
	
	
   ####################################
	# sample.id
	
	# this parses the whole vcf now
   myResults <- scan.vcf.sampid(vcf.fn, method, 1)
   # cache gds
   writeGds(outfn.gds, myResults)
   # runPca(outfn.gds)


	if (verbose) cat(date(), "\tDone.\n")

	return(invisible(NULL))
}



mysnpgdsVCF2GDS(vcf.fn, gds.fn, verbose=TRUE, method="biallelic.only", nblock=500)
