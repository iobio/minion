#!/usr/bin/Rscript
sink("/dev/null")
library(gdsfmt)
suppressMessages(library(SNPRelate))
library(rjson)

args <- commandArgs(trailingOnly = TRUE)
gds.fn <- paste("iobio/cache/",args[1], sep="")
ld.in <- as.numeric(args[2]) # 0.4
maf.in <- as.numeric(args[3]) # 0.03

if(is.na(args[4])) {
 pop.id <- NULL
} else {
 #pop.id <- unlist(strsplit(args[4], split=","))
 pop.id <- args[-(1:3)]
}

(genofile <- openfn.gds(gds.fn))
# snpset <- snpgdsLDpruning(genofile, ld.threshold=ld.in)
# snpset.id <- unlist(snpset)
# invisible(pca <- snpgdsPCA(genofile, maf=maf.in, missing.rate=0.05,snp.id=snpset.id, num.thread=3, sample.id=pop.id))
invisible(pca <- snpgdsPCA(genofile, maf=maf.in, missing.rate=0.05, num.thread=3, sample.id=pop.id))
#pca <- snpgdsPCA(genofile, maf=maf.in, missing.rate=0.05,snp.id=snpset.id, num.thread=3, sample.id=pop.id)
# pop_code <- scan("/Users/chase/Tools/freebayes/data/CEU_YRI_pop.txt", what=character())
# #pop_code <- scan("pop_cont.txt", what=character())
# pop_code <- c('CEU','CEU','CEU','CEU','CEU','CEU','CEU','CEU','CEU','CEU', 'YRI','YRI','YRI','YRI','YRI','YRI','YRI','YRI','YRI','YRI', 'GBR','GBR','GBR','GBR','GBR','GBR','GBR','GBR','GBR','GBR')
# race <- as.factor(pop_code)
# plot(pca$eigenvect[,2], pca$eigenvect[,1], xlab="Principal Component 2",ylab="Principal Component 1", type="n")
# points(pca$eigenvect[,2], pca$eigenvect[,1], col=rainbow(max(1:nlevels(race)))[race])
# legend("topleft", legend=levels(race), text.col=rainbow(max(1:nlevels(race)))[1:nlevels(race)])
#tmp <- structure(list(ev2 = pca$eigenvect[,2] , ev1 = pca$eigenvect[,1])) 
mat1 <- cbind(pca$eigenvect[,1:2], pca$sample.id)
sink() 
cat(apply(mat1, 1, paste, collapse=","), sep="\t")
cat("\n")

#cat(toJSON(tmp))
